const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: "database/main.sqlite" });
const chalk = require('chalk');

module.exports = async (client) => {
    console.log(chalk.yellow.bold(`${client.user.username}`), chalk.greenBright(`IS READY NOW!`));

    await db.set(`botInfo.server`, client.guilds.cache.size);

    const arrMessage = ['d.h', 'My defaul prefix is: d.', 'You can tag me to know prefix of your servers'];
    const arrStatus = ['online', 'dnd', 'idle'];

    // count variable
    var oldMessage = 0;
    var oldStatus = 0;

    var rerollMessage = '';
    var rerollStatus = '';

    setInterval(() => {
        if (oldMessage !== arrMessage.length - 1) {
            rerollMessage = arrMessage[oldMessage];
            ++oldMessage
        } else {
            rerollMessage = arrMessage[2];
            oldMessage = 0;
        };

        if (oldStatus !== arrMessage.length - 1) {
            rerollStatus = arrStatus[oldStatus];
            ++oldStatus
        } else {
            rerollStatus = arrStatus[2];
            oldStatus = 0;
        };

        client.user.setPresence({
            activities: [{
                name: rerollMessage,
                type: 0
            }],
            status: rerollStatus
        });
    }, 20000);
};