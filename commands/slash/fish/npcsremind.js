const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const core = require('../../../core/fish/npcsremind');
const { buildCtxFromInteraction } = require('../../../util/buildCtx');

module.exports = {
    name: 'npcsremind',
    category: __dirname.split(/(\\|\/)/).pop(),
    slashData: new SlashCommandBuilder()
        .setName('npcsremind')
        .setDescription('Remind you when you can summoning NPC again.'),
    async run(interaction, lang) {
        await interaction.reply({ content: '⏳', flags: MessageFlags.Ephemeral });
        await interaction.deleteReply().catch(() => { });

        const ctx = buildCtxFromInteraction(interaction);
        return core.run.call(this, ctx, lang);
    }
};