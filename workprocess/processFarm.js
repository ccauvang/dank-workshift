const { EmbedBuilder } = require("@discordjs/builders");
const { QuickDB } = require("quick.db");
const db = new QuickDB({ filePath: "database/main.sqlite" });
const { setLocale, ie } = require("../util/i18n");
const deleteMessageSafe = require("../util/deleteMessage");
require("dotenv").config();

const SEED_DATA = {
    "1050571150985543710": {
        key: "beans",
        displayName: "Bean Seeds",
        emoji: "<:BeanSeeds:1543592918189740042>"
    },
    "997302171110481960": {
        key: "potato",
        displayName: "Potato",
        emoji: "<:PotatoCrate:1543592931837874356>"
    },
    "996880154318090290": {
        key: "corn",
        displayName: "Corn",
        emoji: "<:CornBag:1543592926225895444>"
    },
    "998015510992130068": {
        key: "carrot",
        displayName: "Carrot",
        emoji: "<:CarrotSeeds:1543592924065824819>"
    },
    "998341356034478241": {
        key: "broccoli",
        displayName: "Broccoli",
        emoji: "<:BroccoliSeeds:1543592920257404938>"
    },
    "1050571042436943893": {
        key: "watermelon",
        displayName: "Watermelon",
        emoji: "<:WatermelonSeeds:1543592936074256404>"
    },
    "1408550527679074365": {
        key: "taro",
        displayName: "Taro",
        emoji: "<:TaroSeeds:1543592934124032151>"
    },
    "1064912414430220388": {
        key: "lotus-flower",
        displayName: "Lotus Flower",
        emoji: "<:Lotusseed:1543592929921335326>"
    },
    "1230865725166452836": {
        key: "delta9",
        displayName: "Delta9",
        emoji: "<:Delta9Seeds:1543592928100876298>"
    }
};

// match: <:emojiName:emojiId> Seed Display Name ready|wilted <t:unixTs:R>
const PLOT_LINE_REGEX = /<:(\w+):(\d+)>\s*(.+?)\s+(ready|wilted)\s+<t:(\d+):R>/;

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

    const farmPath = `User._${userID}.farm`;
    const existingFarm = (await db.get(farmPath)) || { channelId: null };
    const farm = { channelId: existingFarm.channelId };

    let plotIndex = -1;
    for (const line of lines) {
        if (line.startsWith("###")) continue;
        plotIndex++;

        if (plotIndex > 8) continue; // cap 0-8, 9 plot max

        const match = line.match(PLOT_LINE_REGEX);
        const status = match ? match[4] : null;

        if (status != "ready") continue; // growing/wilted/empty/no-match - not tracked

        const [, , emojiId, , , tsRaw] = match;
        const seedInfo = SEED_DATA[emojiId];
        if (!seedInfo) continue; // unknown seed, skip

        const harvestAt = parseInt(tsRaw);
        const key = `${harvestAt}`;

        if (!farm[seedInfo.key]) farm[seedInfo.key] = {};
        if (!farm[seedInfo.key][key]) {
            farm[seedInfo.key][key] = { harvestAt, count: 0 };
        }
        farm[seedInfo.key][key].count++;
    }

    if (farm.channelId != message.channelId) {
        farm.channelId = message.channelId;
    }

    // skip write if unchanged (avoid churn on identical re-parse)
    if (JSON.stringify(existingFarm) != JSON.stringify(farm)) {
        await db.set(farmPath, farm);

        const inIndex = await db.get(`FarmRemind.${userID}`);
        if (!inIndex) {
            await db.set(`FarmRemind.${userID}`, true);
        }
    }
}

async function checkFarmRemind(client) {
    const farmIndex = (await db.get("FarmRemind")) || {};
    const userIDs = Object.keys(farmIndex);
    const now = Math.floor(Date.now() / 1000);

    for (const userID of userIDs) {
        const farm = await db.get(`User._${userID}.farm`);
        if (!farm) {
            await db.delete(`FarmRemind.${userID}`); // stale index entry, farm gone, purge
            continue;
        }

        const channelId = farm.channelId;
        const readyPlots = [];
        const dbPaths = [];
        const affectedSeedKeys = [];

        for (const seedKey of Object.keys(farm)) {
            if (seedKey == "channelId") continue;

            const seedInfo = Object.values(SEED_DATA).find((s) => s.key == seedKey);
            const seedGroup = farm[seedKey];
            let readyInGroup = 0;

            if (!seedInfo) {
                await db.delete(`User._${userID}.farm.${seedKey}`);
                continue;
            }
            const timeKeys = Object.keys(seedGroup);

            for (const timeKey of timeKeys) {
                const entry = seedGroup[timeKey];
                if (!entry || entry.harvestAt == null) continue;
                if (now < entry.harvestAt) continue;

                readyPlots.push({ ...seedInfo, count: entry.count });
                dbPaths.push(`User._${userID}.farm.${seedKey}.${timeKey}`);
                readyInGroup++
            }

            if (readyInGroup > 0) {
                affectedSeedKeys.push(seedKey);
            }

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
                        seedName: s.displayName,
                        count: s.count
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

            for (const seedKey of affectedSeedKeys) {
                const group = await db.get(`User._${userID}.farm.${seedKey}`);
                if (!group || Object.keys(group).length < 1) {
                    await db.delete(`User._${userID}.farm.${seedKey}`);
                }
            }

            const remaining = await db.get(`User._${userID}.farm`);
            const hasAnyPlot = remaining && Object.keys(remaining).some((k) => k != "channelId");
            if (!hasAnyPlot) {
                await db.delete(`FarmRemind.${userID}`);
                await db.delete(`User._${userID}.farm`);
            }
        } catch (error) {
            console.error(`Error sending farm remind: User ${userID}.`, error);
            // send fail, leave db entries untouched, retry next tick
        }
    }
}

function startFarmPoll(client, intervalMs = 20 * 1e3) {
    setInterval(() => {
        checkFarmRemind(client).catch(console.error);
    }, intervalMs);
}

module.exports = { processFarm, startFarmPoll };