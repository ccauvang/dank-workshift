const { EmbedBuilder } = require('@discordjs/builders');
const { setLocale, ie } = require('../../util/i18n');
const { timeFormat } = require('../../util/timeFormat')

module.exports = {
    name: 'uptime',
    description: 'info.uptime.description',
    aliases: ['up', 'live'],
    cooldown: 5,
    category: __dirname.split('\\').pop(),
    usage: '^uptime',
    async run(message, lang) {
        setLocale(lang);

        const timeRaw = Math.floor(process.uptime());
        const timeAfterFormat = timeFormat(timeRaw, lang);
        const uptimeCard = new EmbedBuilder()
            .setTitle(ie.__('info.uptime.card.title'))
            .setDescription(ie.__mf(`${this.category}.${this.name}.card.description`, { time: timeAfterFormat }))
            .setColor(0x00FF80)
            .setTimestamp();

        message.channel.send({ embeds: [uptimeCard] }).then(msg => {
            setTimeout(() => {
                msg.delete().catch(console.error);
            }, 30 * 1e3);
        });
    }
};