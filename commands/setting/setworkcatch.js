const { EmbedBuilder } = require('@discordjs/builders');
const { setLocale, ie } = require('../../util/i18n');
const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: 'database/main.sqlite' });

module.exports = {
    name: 'setworkcatch',
    description: 'setting.setworkcatch.description',
    aliases: ['swc', 'wc'],
    cooldown: 5,
    category: __dirname.split('\\').pop(),
    usage: '^setworkcatch or ^swc',
    async run(message, lang) {
        setLocale(lang);

        const userStatus = await db.get(`User._${message.author.id}.catchDankMsg`);

        if (userStatus == null) {
            await db.set(`User._${message.author.id}.catchDankMsg`, 1);

            const newUserCard = new EmbedBuilder()
                .setTitle(ie.__(`${this.category}.${this.name}.newUserCard.title`))
                .setDescription(ie.__(`${this.category}.${this.name}.newUserCard.description`))
                .setColor(0x00FF80)
                .setTimestamp();

            message.channel.send({ embeds: [newUserCard] }).then(msg => {
                setTimeout(() => {
                    msg.delete().catch(console.error);
                }, 30 * 1e3);
            });
            return;
        };

        const settingCard = new EmbedBuilder()
            .setTitle(ie.__mf(`${this.category}.${this.name}.settingCard.title`, { status: userStatus == 1 ? ie.__('common.Off') : ie.__('common.On') }))
            .setTimestamp();

        if (userStatus) {
            await db.set(`User._${message.author.id}.catchDankMsg`, 0);
            settingCard.setColor(0xFF0000)
            message.channel.send({ embeds: [settingCard] }).then(msg => {
                setTimeout(() => {
                    msg.delete().catch(console.error);
                }, 30 * 1e3);
            });
            return;
        } else {
            await db.set(`User._${message.author.id}.catchDankMsg`, 1);
            settingCard.setColor(0x00FF80)
            message.channel.send({ embeds: [settingCard] }).then(msg => {
                setTimeout(() => {
                    msg.delete().catch(console.error);
                }, 30 * 1e3);
            });
            return;
        };
    }
};