const { EmbedBuilder } = require('@discordjs/builders');
const { setLocale, ie } = require('../../util/i18n');
const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: 'database/main.sqlite' });

module.exports = {
    name: 'help',
    aliases: ['h'],
    description: 'info.help.description',
    cooldown: 5,
    category: __dirname.split('\\').pop(),
    usage: '^help or ^h',
    async run(message, lang, args) {
        setLocale(lang);

        var prefixServer = await db.get(`Guild._${message.guild.id}.prefix`);
        if (prefixServer == null) prefixServer = 'd.';

        const client = message.client;

        if (!args[0]) {

            const helpCard = new EmbedBuilder()
                .setTitle(ie.__(`${this.category}.${this.name}.helpCard.title`))
                .setDescription(ie.__(`${this.category}.${this.name}.helpCard.description`))
                .setColor(0x00FF80)
                .setFooter({ text: ie.__(`${this.category}.${this.name}.helpCard.footer`).replace(/[\^]/g, prefixServer) })
                .setTimestamp();

            const categories = client.categories.keys();
            for (ctg of categories) {
                const commands = client.categories.get(ctg);
                const commandFields = '<:CTG_2:1314635037198520352>' + commands.join(', ');
                helpCard.addFields({
                    name: ctg, value: commandFields, inline: false
                });
            };
            message.channel.send({ embeds: [helpCard] }).then(msg => {
                setTimeout(() => {
                    msg.delete().catch(console.error);
                }, 90 * 1e3);
            });
            return;
        };

        const command = client.commands.get(args[0]) || client.commands.get(client.aliases.get(args[0]));

        if (command) {

            const helpCmdCard = new EmbedBuilder()
                .setTitle(ie.__(`${this.category}.${this.name}.helpCmdCard.title`))
                .setDescription(ie.__(`${this.category}.${this.name}.helpCmdCard.description`))
                .addFields({
                    name: ie.__mf(`${this.category}.${this.name}.helpCmdCard.fields.name`, { name: command.name }),
                    value: ie.__mf(`${this.category}.${this.name}.helpCmdCard.fields.value`, {
                        aliases: command.aliases.join(', '),
                        description: ie.__(command.description),
                        cooldown: command.cooldown,
                        category: command.category,
                        usage: command.usage.replace(/[\^]/g, prefixServer)
                    }),
                    inline: true
                })
                .setColor(0x00FF80)
                .setFooter({ text: ie.__(`${this.category}.${this.name}.helpCmdCard.footer`).replace(/[\^]/g, prefixServer) })
                .setTimestamp();

            message.channel.send({ embeds: [helpCmdCard] }).then(msg => {
                setTimeout(() => {
                    msg.delete().catch(console.error);
                }, 60 * 1e3);
            });
            return;
        };
    }
};