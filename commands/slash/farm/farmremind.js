const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const core = require('../../../core/farm/farmremind');
const { buildCtxFromInteraction } = require('../../../util/buildCtx');

module.exports = {
    name: 'farmremind',
    category: __dirname.split(/(\\|\/)/).pop(),
    slashData: new SlashCommandBuilder()
        .setName('farmremind')
        .setDescription('Remind you when your farm plant fully grow, ready to harvest.'),
    async run(interaction, lang) {
        await interaction.reply({ content: '⏳', flags: MessageFlags.Ephemeral });
        await interaction.deleteReply().catch(() => { });

        const ctx = buildCtxFromInteraction(interaction);
        return core.run.call(this, ctx, lang);
    }
};