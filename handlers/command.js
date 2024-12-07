const { readdirSync } = require('fs');

module.exports = (client) => {
    const categorysCmd = readdirSync('commands');

    categorysCmd.forEach((category) => {
        const folderCmd = readdirSync(`commands/${category}`).filter(fileCmd => fileCmd.endsWith('.js'));

        folderCmd.forEach((fileCmd) => {
            const command = require(`../commands/${category}/${fileCmd}`);
            client.commands.set(command.name, command);

            if (client.categorys.has(category)) {
                client.categorys.set(category, [...client.categorys.get(category), command.name]);
            } else {
                client.categorys.set(category, [command.name])
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
    // console.log(client.categorys);
};