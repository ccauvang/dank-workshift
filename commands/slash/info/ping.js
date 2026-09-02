const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const core = require('../../../core/info/ping');
const { buildCtxFromInteraction } = require('../../../util/buildCtx');

module.exports = {
    name: 'ping',
    category: __dirname.split(/(\\|\/)/).pop(),
    slashData: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Show my ping.'),
    async run(interaction, lang) {
        // quick ack to satisfy Discord's 3s rule, dismiss right after
        await interaction.reply({ content: '⏳', flags: MessageFlags.Ephemeral });
        await interaction.deleteReply().catch(() => { });

        const ctx = buildCtxFromInteraction(interaction);
        return core.run.call(this, ctx, lang);
    }
};