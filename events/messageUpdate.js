const { processFarm } = require('../workprocess/processFarm');
require('dotenv').config();

module.exports = async (client, oldMessage, newMessage) => {
    if (newMessage.author?.id != process.env.IDBOTDISCORD) return;
    await processFarm(newMessage);
};