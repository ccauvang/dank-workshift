// commands/slash/info/uptime.js
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const core = require('../../../core/info/uptime');
const { buildCtxFromInteraction } = require('../../../util/buildCtx');

module.exports = {
    name: 'uptime',
    category: __dirname.split(/(\\|\/)/).pop(),
    slashData: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Show how long I online.'),
    async run(interaction, lang) {
        await interaction.reply({ content: '⏳', flags: MessageFlags.Ephemeral });
        await interaction.deleteReply().catch(() => { });

        const ctx = buildCtxFromInteraction(interaction);
        return core.run.call(this, ctx, lang);
    }
};