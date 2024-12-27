const { EmbedBuilder } = require('@discordjs/builders');
const { setLocale, ie } = require('../../util/i18n');

module.exports = {
    name: 'ping',
    aliases: ['pi'],
    description: 'info.ping.description',
    cooldown: 5,
    category: __dirname.split('\\').pop(),
    usage: ['^ping'],
    async run(message, lang) {
        setLocale(lang);

        const ping = message.client.ws.ping;

        const pingCard = new EmbedBuilder()
            .setTitle(ie.__('info.ping.card.title'))
            .setDescription(ie.__mf(`${this.category}.${this.name}.card.description`, { ping: ping }))
            .setColor(0x00FF80)
            .setTimestamp();

        message.channel.send({ embeds: [pingCard] }).then(msg => {
            setTimeout(() => {
                msg.delete().catch(console.error);
            }, 30 * 1e3);
        });
    }
};