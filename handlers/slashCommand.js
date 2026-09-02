const { readdirSync } = require('fs');
const { Collection } = require('discord.js');

module.exports = (client) => {
    client.slashCommands = new Collection();

    const categoriesCmd = readdirSync('commands/slash');

    categoriesCmd.forEach((category) => {
        const folderCmd = readdirSync(`commands/slash/${category}`).filter(f => f.endsWith('.js'));

        folderCmd.forEach((fileCmd) => {
            const command = require(`../commands/slash/${category}/${fileCmd}`);
            client.slashCommands.set(command.name, command);
        });
    });
};