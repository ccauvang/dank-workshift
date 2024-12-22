const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: 'database/main.sqlite' });

async function workProcessMgs(message) {
    if (!message) return;
    if (message.author.id != '270904126974590976') return;
    if (message.interaction == null) return;
    if (message.embeds.length < 1) return;
    const userCatchStatus = await db.get(`User._${message.interactionMetadata.user.id}.catchDankMsg`);
    if (userCatchStatus == null || userCatchStatus == 0) return;

    const embedOfMessage = message.embeds[0];
    const msgRootInteract = message.interaction;

    console.log(embedOfMessage);
    console.log(msgRootInteract);

    if (msgRootInteract.commandName == 'work shift') {
        await message.react('1313857088245731359');
        await message.channel.send({ embeds: [embedOfMessage] }).then(msg => {
            if (msg.deletable) {
                setTimeout(() => {
                    msg.delete().catch(console.error);
                    message.reactions.removeAll();
                }, 30 * 1e3);
            };
        });
    };
};

module.exports = workProcessMgs;