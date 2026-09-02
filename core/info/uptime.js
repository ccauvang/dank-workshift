const { EmbedBuilder } = require('@discordjs/builders');
const { setLocale, ie } = require('../../util/i18n');
const { timeFormat } = require('../../util/timeFormat');
const deleteMessageSafe = require('../../util/deleteMessage');

module.exports = {
    async run(ctx, lang) {
        setLocale(lang);

        const timeRaw = Math.floor(process.uptime());
        const timeAfterFormat = timeFormat(timeRaw, lang);

        const uptimeCard = new EmbedBuilder()
            .setTitle(ie.__('info.uptime.card.title'))
            .setDescription(ie.__mf(`${this.category}.${this.name}.card.description`, { time: timeAfterFormat }))
            .setColor(0x00FF80)
            .setTimestamp();

        return ctx.reply({ embeds: [uptimeCard] }).then(msg => {
            deleteMessageSafe(msg, 30 * 1e3);
        });
    }
};