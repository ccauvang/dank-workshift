const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: 'database/main.sqlite' });
require('dotenv').config();

/** 
*@global 
*@param {object} message - The message of the Dank bot.
*@param {string} IDUser - The ID of the user use interaction or prefix.
*/

async function workProcessMgs(message) {
    if (!message) return;
    if (message.author.id != process.env.IDBOTDISCORD) return;
    if (message.embeds.length < 1) return;

    /** 
     *@param {object} message - The message of the Dank bot.
     *@param {string} IDUser - The ID of the user use interaction or prefix.
     *@param {string} commandName - Name of the work command.
     */

    async function getInfoUserAndSendTheHelpMessage(message, IDUser, commandName) {
        const nameCommand = 'work shift';
        if (commandName == nameCommand) {
            const userCatchStatus = await db.get(`User._${IDUser}.catchDankMsg`);
            if (userCatchStatus == null || userCatchStatus == 0) return;
            const embedOfMessage = message.embeds[0];
            if (embedOfMessage.toString().match('the ball!') != null) return;
            // const msgRootInteract = message.interaction;

            console.log(embedOfMessage);
            // console.log(msgRootInteract);


            await message.react('1313857088245731359');
            await message.channel.send({ embeds: [embedOfMessage] }).then(msg => {
                if (msg.deletable) {
                    setTimeout(() => {
                        message.reactions.removeAll().catch(console.error);
                        msg.delete().catch(console.error);
                    }, 30 * 1e3);
                };
            });
        };
    }

    if (message.interaction != null) {
        const useID = message.interactionMetadata.user.id;
        const commandName = message.interaction.commandName;

        await getInfoUserAndSendTheHelpMessage(message, useID, commandName);
    } else {
        const useID = message.mentions.repliedUser.id;
        const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
        var commandName = repliedMessage.content.match(/work shift/g);
        if (commandName != null) commandName = commandName[0];


        await getInfoUserAndSendTheHelpMessage(message, useID, commandName);
    };
};

module.exports = workProcessMgs;