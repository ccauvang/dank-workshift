const { EmbedBuilder } = require('@discordjs/builders');
const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: 'database/main.sqlite' });
const { setLocale, ie } = require('../../util/i18n');
const deleteMessageSafe = require('../../util/deleteMessage');

module.exports = {
    async run(ctx, lang, args) {
        setLocale(lang);

        var prefixServer = await db.get(`Guild._${ctx.guildId}.prefix`);
        if (prefixServer == null) prefixServer = 'd.';

        const client = ctx.client;

        if (!args[0]) {
            const helpCard = new EmbedBuilder()
                .setTitle(ie.__(`${this.category}.${this.name}.helpCard.title`))
                .setDescription(ie.__(`${this.category}.${this.name}.helpCard.description`))
                .setColor(0x00FF80)
                .setFooter({ text: ie.__(`${this.category}.${this.name}.helpCard.footer`).replace(/[\^]/g, prefixServer) })
                .setTimestamp();

            const categories = client.categories.keys();
            for (const ctg of categories) {
                const commands = client.categories.get(ctg);
                const commandFields = '<:CTG_2:1314635037198520352>' + commands.join(', ');
                helpCard.addFields({
                    name: ctg, value: commandFields, inline: false
                });
            };

            const slashNames = [...client.slashCommands.keys()];
            if (slashNames.length > 0) {
                helpCard.addFields({
                    name: ie.__(`${this.category}.${this.name}.helpCard.slashCommandsField.name`),
                    value: slashNames.map(n => `\`/${n}\``).join(', '),
                    inline: false
                });
            }

            return ctx.reply({ embeds: [helpCard] }).then(msg => {
                deleteMessageSafe(msg, 90 * 1e3);
            });
        };

        const command = client.commands.get(args[0]) || client.commands.get(client.aliases.get(args[0]));

        if (command) {
            const dataCommand = {
                aliases: command.aliases.join(', '),
                description: ie.__(command.description),
                cooldown: command.cooldown,
                category: command.category,
                usage: ie.__(`${this.category}.${this.name}.helpCmdCard.fields.hasNoUsage`)
            };

            if (command.usage && Array.isArray(command.usage)) {
                let usage = [];
                command.usage.forEach((use) => {
                    usage.push(use.replace(/[\^]/g, prefixServer));
                });
                dataCommand.usage = usage.join(', ');
            };

            const helpCmdCard = new EmbedBuilder()
                .setTitle(ie.__(`${this.category}.${this.name}.helpCmdCard.title`))
                .setDescription(ie.__(`${this.category}.${this.name}.helpCmdCard.description`))
                .addFields({
                    name: ie.__mf(`${this.category}.${this.name}.helpCmdCard.fields.name`, { name: command.name }),
                    value: ie.__mf(`${this.category}.${this.name}.helpCmdCard.fields.value`, dataCommand),
                    inline: true
                })
                .setColor(0x00FF80)
                .setFooter({ text: ie.__(`${this.category}.${this.name}.helpCmdCard.footer`).replace(/[\^]/g, prefixServer) })
                .setTimestamp();

            const slashCommand = client.slashCommands.get(command.name);
            if (slashCommand) {
                helpCmdCard.addFields({
                    name: ie.__(`${this.category}.${this.name}.helpCmdCard.fields.slashName`),
                    value: ie.__mf(`${this.category}.${this.name}.helpCmdCard.fields.slashValue`, { name: slashCommand.name }),
                    inline: true
                });
            }

            return ctx.reply({ embeds: [helpCmdCard] }).then(msg => {
                deleteMessageSafe(msg, 60 * 1e3);
            });
        };
    }
};