const { EmbedBuilder } = require("@discordjs/builders");
const { QuickDB } = require("quick.db");
const db = new QuickDB({ filePath: "database/main.sqlite" });
const { setLocale, ie } = require("../util/i18n");
const deleteMessageSafe = require("../util/deleteMessage");
require("dotenv").config();

// "> You can summon another NPC <t:1790141442:R>."
const SUMMON_TIME_REGEX = /<t:(\d+):R>/;

// covers both the raw client-side field you dumped and the standard discord.js embed shape
function getEmbedTitle(embed) {
    return embed?.rawTitle ?? embed?.title ?? embed?.data?.title ?? null;
}
function getEmbedDescription(embed) {
    return embed?.rawDescription ?? embed?.description ?? embed?.data?.description ?? null;
}

async function processNPCSummon(message) {
    if (!message) return;
    if (message.author.id != process.env.IDBOTDISCORD) return;
    if (!message.embeds || message.embeds.length < 1) return;

    let userID = null;

    if (message.interaction != null || message.interactionMetadata != null) {
        const interactionName = message.interaction?.commandName || message.interactionMetadata?.commandName;
        if (!/^fish npc$/i.test(interactionName || "")) return; // not our command, skip

        userID =
            message.interaction != null
                ? message.interaction?.user?.id
                : message.interactionMetadata?.user?.id;
    } else {
        if (message.reference == null) return;

        let repliedMessage = message.channel.messages.cache.get(message.reference.messageId);
        if (!repliedMessage) {
            try {
                repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
            } catch (error) {
                if (error.code == 10008) return; // msg deleted, expected, skip silently
                console.error('processNPCSummon fetch fail:', error);
                return;
            }
        }

        if (!repliedMessage || repliedMessage.content == "") return;
        // covers both prefix aliases: "f npc" and "fish npc"
        if (repliedMessage.content.match(/\b(fish|f)\s+npc\b/i) == null) return;

        userID =
            message.mentions.repliedUser != null
                ? message.mentions.repliedUser.id
                : repliedMessage.author.id;
    }

    if (!userID) return; // couldn't confirm owner, skip

    const userCatchStatus = await db.get(`User._${userID}.catchNPCSummonMsg`);
    if (userCatchStatus == null || userCatchStatus == 0) return;

    // "fish npc" can render other embeds too (e.g. already summoned) - only track the Summoning Table one
    const summonEmbed = message.embeds.find((e) => getEmbedTitle(e) == "Summoning Table");
    if (!summonEmbed) return;

    const description = getEmbedDescription(summonEmbed);
    if (!description) return;

    const match = description.match(SUMMON_TIME_REGEX);
    if (!match) return; // can already summon / no timer shown, nothing to track

    const readyAt = parseInt(match[1]);
    const npcPath = `User._${userID}.npcSummon`;
    const existing = await db.get(npcPath);
    const data = { readyAt, channelId: message.channelId };

    // skip write if unchanged (avoid churn on identical re-parse)
    if (!existing || existing.readyAt != data.readyAt || existing.channelId != data.channelId) {
        await db.set(npcPath, data);

        const inIndex = await db.get(`NPCRemind.${userID}`);
        if (!inIndex) {
            await db.set(`NPCRemind.${userID}`, true);
        }
    }
}

async function checkNPCSummonRemind(client) {
    const npcIndex = (await db.get("NPCRemind")) || {};
    const userIDs = Object.keys(npcIndex);
    const now = Math.floor(Date.now() / 1000);

    for (const userID of userIDs) {
        const npcSummon = await db.get(`User._${userID}.npcSummon`);
        if (!npcSummon) {
            await db.delete(`NPCRemind.${userID}`); // stale index entry, purge
            continue;
        }
        if (now < npcSummon.readyAt) continue; // not ready yet

        const channel = client.channels.cache.get(npcSummon.channelId);
        if (!channel) continue; // not in cache, leave entry, retry next tick

        try {
            const lang = channel.guildId
                ? (await db.get(`Guild._${channel.guildId}.localLanguage`)) || process.env.LANGUAGE
                : process.env.LANGUAGE;
            setLocale(lang);

            const remindCard = new EmbedBuilder()
                .setTitle(ie.__(`fish.npcsremind.remindCard.title`))
                .setDescription(ie.__(`fish.npcsremind.remindCard.description`))
                .setColor(0x00ff80);

            await channel
                .send({ content: `<@${userID}>`, embeds: [remindCard] })
                .then((msg) => {
                    deleteMessageSafe(msg, 180 * 60 * 1e3, `NPC summon remind msg for user ${userID}.`);
                });

            await db.delete(`User._${userID}.npcSummon`);
            await db.delete(`NPCRemind.${userID}`);
        } catch (error) {
            console.error(`Error sending NPC summon remind: User ${userID}.`, error);
            // send fail, leave db entries untouched, retry next tick
        }
    }
}

function startNPCSummonPoll(client, intervalMs = 30 * 1e3) {
    setInterval(() => {
        checkNPCSummonRemind(client).catch(console.error);
    }, intervalMs);
}

module.exports = { processNPCSummon, startNPCSummonPoll };