const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: "database/main.sqlite" });
const chalk = require('chalk');
const moment = require('moment');

module.exports = async (client) => {
    const now = moment().format('hh:mm:ss | DD/MMM/YYYY');
    console.log(chalk.yellow.bold(`${client.user.username}`), chalk.greenBright(`IS READY NOW!`));
    console.log(chalk.cyanBright(now))

    await db.set(`botInfo.server`, client.guilds.cache.size);

    const arrMessage = ['d.h', 'My defaul prefix is: d.', 'Tag me to know your prefix server and your Dank Memer work catch status'];
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