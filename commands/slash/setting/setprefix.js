const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const core = require('../../../core/setting/setprefix');
const { buildCtxFromInteraction } = require('../../../util/buildCtx');

module.exports = {
    name: 'setprefix',
    category: __dirname.split(/(\\|\/)/).pop(),
    slashData: new SlashCommandBuilder()
        .setName('setprefix')
        .setDescription('Set your server prefix.'),
    async run(interaction, lang) {
        await interaction.reply({ content: '⏳', flags: MessageFlags.Ephemeral });
        await interaction.deleteReply().catch(() => { });

        const ctx = buildCtxFromInteraction(interaction);
        return core.run.call(this, ctx, lang);
    }
};