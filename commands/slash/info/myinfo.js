const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const core = require('../../../core/info/myinfo');
const { buildCtxFromInteraction } = require('../../../util/buildCtx');

module.exports = {
    name: 'myinfo',
    category: __dirname.split(/(\\|\/)/).pop(),
    slashData: new SlashCommandBuilder()
        .setName('myinfo')
        .setDescription('Show your catch status.'),
    async run(interaction, lang) {
        await interaction.reply({ content: '⏳', flags: MessageFlags.Ephemeral });
        await interaction.deleteReply().catch(() => { });

        const ctx = buildCtxFromInteraction(interaction);
        return core.run.call(this, ctx, lang);
    }
};