const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const core = require('../../../core/setting/setlanguage');
const { buildCtxFromInteraction } = require('../../../util/buildCtx');

module.exports = {
    name: 'setlanguage',
    category: __dirname.split(/(\\|\/)/).pop(),
    slashData: new SlashCommandBuilder()
        .setName('setlanguage')
        .setDescription('Set language bot use in your server.'),
    async run(interaction, lang) {
        await interaction.reply({ content: '⏳', flags: MessageFlags.Ephemeral });
        await interaction.deleteReply().catch(() => { });

        const ctx = buildCtxFromInteraction(interaction);
        return core.run.call(this, ctx, lang);
    }
};