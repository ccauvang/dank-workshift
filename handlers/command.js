const { readdirSync } = require('fs');

module.exports = (client) => {
    const categoriesCmd = readdirSync('commands');

    categoriesCmd.forEach((category) => {
        const folderCmd = readdirSync(`commands/${category}`).filter(fileCmd => fileCmd.endsWith('.js'));

        folderCmd.forEach((fileCmd) => {
            const command = require(`../commands/${category}/${fileCmd}`);
            client.commands.set(command.name, command);

            if (client.categories.has(category)) {
                client.categories.set(category, [...client.categories.get(category), command.name]);
            } else {
                client.categories.set(category, [command.name])
            }

            if (command.aliases && Array.isArray(command.aliases)) {
                command.aliases.forEach((aliases) => {
                    client.aliases.set(aliases, command.name);
                });
            };

        });

    });

    // console.log(client.commands);
    // console.log(client.aliases);
    // console.log(client.categories);
};