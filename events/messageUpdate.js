const { processDankMessage } = require('../util/workDispatcher');
require('dotenv').config();

const timers = new Map();
const DEBOUNCE_MS = 1500;

module.exports = async (client, oldMessage, newMessage) => {
    if (newMessage.author?.id != process.env.IDBOTDISCORD) return;

    clearTimeout(timers.get(newMessage.id));
    timers.set(newMessage.id, setTimeout(() => {
        timers.delete(newMessage.id);
        processDankMessage(newMessage, 'update');
    }, DEBOUNCE_MS));
};