const { EmbedBuilder } = require('@discordjs/builders');
const { setLocale, ie } = require('../../util/i18n');
const deleteMessageSafe = require('../../util/deleteMessage');

module.exports = {
    async run(ctx, lang) {
        setLocale(lang);

        const ping = ctx.client.ws.ping;

        const pingCard = new EmbedBuilder()
            .setTitle(ie.__('info.ping.card.title'))
            .setDescription(ie.__mf(`${this.category}.${this.name}.card.description`, { ping: ping }))
            .setColor(0x00FF80)
            .setTimestamp();

        return ctx.reply({ embeds: [pingCard] }).then(msg => {
            deleteMessageSafe(msg, 30 * 1e3);
        });
    }
};