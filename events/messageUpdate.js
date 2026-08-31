const { processFarm } = require('../workprocess/processFarm');
const dumpMessage = require('../util/dumpMessage');
require('dotenv').config();

module.exports = async (client, oldMessage, newMessage) => {
    if (newMessage.author?.id != process.env.IDBOTDISCORD) return;
    await processFarm(newMessage);
};