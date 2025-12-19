const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: 'database/main.sqlite' });
require('dotenv').config();

async function workProcessMgs(message) {
    if (!message) return;
    if (message.author.id != process.env.IDBOTDISCORD) return;
    if (message.interaction == null) return;
    if (message.embeds.length < 1) return;

    const userCatchStatus = await db.get(`User._${message.interactionMetadata.user.id}.catchDankMsg`);
    if (userCatchStatus == null || userCatchStatus == 0) return;

    const embedOfMessage = message.embeds[0];
    const msgRootInteract = message.interaction;
    const nameCommand = 'work shift';

    console.log(embedOfMessage);
    console.log(msgRootInteract);


    if (msgRootInteract.commandName == nameCommand) {
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
};

module.exports = workProcessMgs;