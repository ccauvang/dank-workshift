const { readdirSync } = require('fs');

module.exports = (client) => {
    const categoriesCmd = readdirSync('commands/prefix');

    categoriesCmd.forEach((category) => {
        const folderCmd = readdirSync(`commands/prefix/${category}`).filter(f => f.endsWith('.js'));

        folderCmd.forEach((fileCmd) => {
            const command = require(`../commands/prefix/${category}/${fileCmd}`);
            client.commands.set(command.name, command);

            if (client.categories.has(category)) {
                client.categories.set(category, [...client.categories.get(category), command.name]);
            } else {
                client.categories.set(category, [command.name]);
            }

            if (command.aliases && Array.isArray(command.aliases)) {
                command.aliases.forEach((a) => client.aliases.set(a, command.name));
            };
        });
    });
};