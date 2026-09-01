const { processFarm } = require('../workprocess/processFarm');
require('dotenv').config();

const cooldownMap = new Map();
const COOLDOWN_MS = 3000;

module.exports = async (client, oldMessage, newMessage) => {
    if (newMessage.author?.id != process.env.IDBOTDISCORD) return;

    if (cooldownMap.has(newMessage.id)) return;
    cooldownMap.set(newMessage.id, true);
    setTimeout(() => cooldownMap.delete(newMessage.id), COOLDOWN_MS);

    await processFarm(newMessage);
};