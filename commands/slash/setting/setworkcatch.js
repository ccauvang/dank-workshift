const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const core = require('../../../core/setting/setworkcatch');
const { buildCtxFromInteraction } = require('../../../util/buildCtx');

module.exports = {
    name: 'setworkcatch',
    category: __dirname.split(/(\\|\/)/).pop(),
    slashData: new SlashCommandBuilder()
        .setName('setworkcatch')
        .setDescription('Set status bot help your work or not.'),
    async run(interaction, lang) {
        await interaction.reply({ content: '⏳', flags: MessageFlags.Ephemeral });
        await interaction.deleteReply().catch(() => { });

        const ctx = buildCtxFromInteraction(interaction);
        return core.run.call(this, ctx, lang);
    }
};