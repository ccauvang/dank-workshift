// commands/slash/info/help.js
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const core = require('../../../core/info/help');
const { buildCtxFromInteraction } = require('../../../util/buildCtx');

module.exports = {
    name: 'help',
    category: __dirname.split(/(\\|\/)/).pop(),
    slashData: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show some info to help you.')
        .addStringOption(opt =>
            opt.setName('command')
                .setDescription('Command name or alias')
                .setRequired(false)
                .setAutocomplete(true)
        ),
    async autocomplete(interaction) {
        const focused = interaction.options.getFocused().toLowerCase();
        const client = interaction.client;

        const allNames = [...new Set([...client.commands.keys()])];

        const filtered = allNames
            .filter(name => name.startsWith(focused))
            .slice(0, 25)
            .map(name => ({ name, value: name }));

        await interaction.respond(filtered);
    },
    async run(interaction, lang) {
        await interaction.reply({ content: '⏳', flags: MessageFlags.Ephemeral });
        await interaction.deleteReply().catch(() => { });

        const cmdName = interaction.options.getString('command');
        const args = cmdName ? [cmdName] : [];

        const ctx = buildCtxFromInteraction(interaction);
        return core.run.call(this, ctx, lang, args);
    }
};