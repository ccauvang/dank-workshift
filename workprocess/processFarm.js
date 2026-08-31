const { EmbedBuilder } = require("@discordjs/builders");
const { QuickDB } = require("quick.db");
const db = new QuickDB({ filePath: "database/main.sqlite" });
const { setLocale, ie } = require("../util/i18n");
const deleteMessageSafe = require("../util/deleteMessage");
const dumpMessage = require('../util/dumpMessage');
require("dotenv").config();

const SEED_DATA = {
    "1050571150985543710": {
        key: "beans",
        displayName: "Bean Seeds",
        growSeconds: 1 * 3600,
        emoji: "<:BeanSeeds:1543592918189740042>"
    },
    "997302171110481960": {
        key: "potato",
        displayName: "Potato",
        growSeconds: 2 * 3600,
        emoji: "<:PotatoCrate:1543592931837874356>"
    },
    "996880154318090290": {
        key: "corn",
        displayName: "Corn",
        growSeconds: 6 * 3600,
        emoji: "<:CornBag:1543592926225895444>"
    },
    "998015510992130068": {
        key: "carrot",
        displayName: "Carrot",
        growSeconds: 8 * 3600,
        emoji: "<:CarrotSeeds:1543592924065824819>"
    },
    "998341356034478241": {
        key: "broccoli",
        displayName: "Broccoli",
        growSeconds: 18 * 3600,
        emoji: "<:BroccoliSeeds:1543592920257404938>"
    },
    "1050571042436943893": {
        key: "watermelon",
        displayName: "Watermelon",
        growSeconds: 24 * 3600,
        emoji: "<:WatermelonSeeds:1543592936074256404>"
    },
    "1408550527679074365": {
        key: "taro",
        displayName: "Taro",
        growSeconds: 30 * 3600,
        emoji: "<:TaroSeeds:1543592934124032151>"
    },
    "1064912414430220388": {
        key: "lotus-flower",
        displayName: "Lotus Flower",
        growSeconds: 48 * 3600,
        emoji: "<:Lotusseed:1543592929921335326>"
    },
    "1230865725166452836": {
        key: "delta9",
        displayName: "Delta9",
        growSeconds: 60 * 3600,
        emoji: "<:Delta9Seeds:1543592928100876298>"
    }
};

// match: <:emojiName:emojiId> Seed Display Name ready|wilted <t:unixTs:R>
const PLOT_LINE_REGEX = /<:(\w+):(\d+)>\s*(.+?)\s+(ready|wilted)\s+<t:(\d+):R>/;

/**
 * Recursively walk message.components tree, pull out all TextDisplay (type 10) content strings.
 * @param {Array} components
 * @returns {Array<string>}
 */
function extractTextContents(components) {
    let texts = [];
    if (!Array.isArray(components)) return texts;

    components.forEach((c) => {
        if (c.type == 10 && c.content) texts.push(c.content);
        if (Array.isArray(c.components))
            texts = texts.concat(extractTextContents(c.components));
    });

    return texts;
}

/**
 * Parse farm-manage message from Dank bot, save per-plot harvest-ready time in db.
 * @param {object} message - The message of the Dank bot.
 */
async function processFarm(message) {
    if (!message) return;
    if (message.author.id != process.env.IDBOTDISCORD) return;
    if (!message.components || message.components.length < 1) return;

    let userID = null;

    if (message.interaction != null || message.interactionMetadata != null) {
        const interactionName = message.interaction?.commandName || message.interactionMetadata?.commandName;
        if (interactionName != "farm view") return; // not our command, skip

        userID =
            message.interaction != null
                ? message.interaction?.user?.id
                : message.interactionMetadata?.user?.id;
    } else {
        if (message.reference == null) return;

        const repliedMessage = await message.channel.messages.fetch(
            message.reference.messageId
        );
        if (!repliedMessage || repliedMessage.content == "") return;
        if (repliedMessage.content.match(/farm view/i) == null) return;

        userID =
            message.mentions.repliedUser != null
                ? message.mentions.repliedUser.id
                : repliedMessage.author.id;
    }

    if (!userID) return; // couldn't confirm owner, skip

    const userCatchStatus = await db.get(`User._${userID}.catchFarmMsg`);
    if (userCatchStatus == null || userCatchStatus == 0) return;

    const texts = extractTextContents(message.components);
    if (texts.length < 1) return;

    const lines = texts[0].split("\n").filter((line) => line.trim().length > 0);


    let plotIndex = -1;
    for (const line of lines) {
        if (line.startsWith("###")) continue; // header line (farm name), skip, don't count as plot
        plotIndex++;

        if (line.includes("Seems pretty empty")) {
            const plotKey = `User._${userID}.farm.plot-${plotIndex}`;
            const existing = await db.get(plotKey);
            if (existing) await db.delete(plotKey);
            continue;
        }

        const match = line.match(PLOT_LINE_REGEX);
        if (!match) continue;

        const [, , emojiId, , status, tsRaw] = match;
        const plotKey = `User._${userID}.farm.plot-${plotIndex}`;

        if (status == "wilted") {
            // TODO: die-time cleanup branch, revisit once wilt-grace-per-seed data confirmed
            /*
                  const existing = await db.get(plotKey);
                  if (existing) await db.delete(plotKey);
                  */
            continue;
        }

        if (status == "ready") {
            const seedInfo = SEED_DATA[emojiId];
            if (!seedInfo) continue; // unknown seed, can't identify, skip

            await db.set(plotKey, {
                seedKey: seedInfo.key,
                harvestAt: parseInt(tsRaw),
                channelId: message.channelId
            });
        }
    }
}

/**
 * Scan db for any plot past harvestAt, send remind msg, delete entry after send.
 * @param {object} client - Discord client.
 */
async function checkFarmRemind(client) {
    const allUsers = (await db.get("User")) || {};
    const now = Math.floor(Date.now() / 1000);

    for (const userKey of Object.keys(allUsers)) {
        const userData = allUsers[userKey];
        if (!userData || !userData.farm) continue;

        const userID = userKey.replace(/^_/, "");
        const readyPlots = [];
        const dbPaths = [];
        let channelId = null;

        for (const plotKey of Object.keys(userData.farm)) {
            const plot = userData.farm[plotKey];
            if (!plot || plot.harvestAt == null) continue;
            if (now < plot.harvestAt) continue; // not ready yet

            const dbPath = `User._${userID}.farm.${plotKey}`;
            const seedInfo = Object.values(SEED_DATA).find(
                (s) => s.key == plot.seedKey
            );

            if (!seedInfo) {
                await db.delete(dbPath); // junk/unknown seed data, safe purge regardless
                continue;
            }

            readyPlots.push(seedInfo);
            dbPaths.push(dbPath);
            channelId = plot.channelId;
        }

        if (readyPlots.length < 1) continue;

        const channel = client.channels.cache.get(channelId);
        if (!channel) continue; // not cache, leave entries, retry next tick

        try {
            const lang = channel.guildId
                ? (await db.get(`Guild._${channel.guildId}.localLanguage`)) ||
                process.env.LANGUAGE
                : process.env.LANGUAGE;
            setLocale(lang);

            const description = readyPlots
                .map((s) =>
                    ie.__mf("farm.farmremind.remindCard.description", {
                        emoji: s.emoji,
                        seedName: s.displayName
                    })
                )
                .join("\n");

            const remindCard = new EmbedBuilder()
                .setTitle(ie.__(`farm.farmremind.remindCard.title`))
                .setDescription(description)
                .setColor(0x00ff80);

            await channel
                .send({ content: `<@${userID}>`, embeds: [remindCard] })
                .then((msg) => {
                    deleteMessageSafe(
                        msg,
                        3 * 60 * 1e3,
                        `Farm remind msg for user ${userID}.`
                    );
                });

            for (const dbPath of dbPaths) {
                await db.delete(dbPath);
            }
        } catch (error) {
            console.error(`Error sending farm remind: User ${userID}.`, error);
            // send fail, leave db entries untouched, retry next tick
        }
    }
}

/**
 * Start recurring poll for farm harvest remind.
 * @param {object} client - Discord client.
 * @param {number} [intervalMs=30000] - Poll interval in ms.
 */
function startFarmPoll(client, intervalMs = 10 * 1e3) {
    setInterval(() => {
        checkFarmRemind(client).catch(console.error);
    }, intervalMs);
}

module.exports = { processFarm, startFarmPoll };
