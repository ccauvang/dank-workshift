const { EmbedBuilder } = require('@discordjs/builders');
const { setLocale, ie } = require('../../util/i18n');
const deleteMessageSafe = require('../../util/deleteMessage');
const os = require('os');

module.exports = {
    async run(ctx, lang) {
        setLocale(lang);

        const ping = ctx.client.ws.ping;
        const ramUsedMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
        const ramTotalMB = (os.totalmem() / 1024 / 1024).toFixed(0);
        const cpuUsage = process.cpuUsage();
        const cpuPercent = (((cpuUsage.user + cpuUsage.system) / 1000) / process.uptime()).toFixed(2);
        const nodeVersion = process.version;

        const pingCard = new EmbedBuilder()
            .setTitle(ie.__('info.ping.card.title'))
            .setDescription(ie.__mf(`${this.category}.${this.name}.card.description`, { ping: ping }))
            .setColor(0x00FF80)
            .addFields(
                { name: ie.__(`${this.category}.${this.name}.card.fields.ram`), value: `${ramUsedMB} MB / ${ramTotalMB} MB`, inline: true },
                { name: ie.__(`${this.category}.${this.name}.card.fields.cpu`), value: `${cpuPercent}`, inline: true },
                { name: ie.__(`${this.category}.${this.name}.card.fields.node`), value: nodeVersion, inline: true }
            )
            .setTimestamp();

        return ctx.reply({ embeds: [pingCard] }).then(msg => {
            deleteMessageSafe(msg, 30 * 1e3);
        });
    }
};