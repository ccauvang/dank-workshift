const { EmbedBuilder } = require('@discordjs/builders');
const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: 'database/main.sqlite' });
const { setLocale, ie } = require('../../util/i18n');
const deleteMessageSafe = require('../../util/deleteMessage');

module.exports = {
    async run(ctx, lang) {
        setLocale(lang);

        const toStatus = (v) => (v == 0 || v == null) ? ie.__('common.Off') : ie.__('common.On');
        const userData = await db.get(`User._${ctx.author.id}`) || {};

        const myInfoCard = new EmbedBuilder()
            .setTitle(ie.__(`${this.category}.${this.name}.card.title`))
            .setDescription(ie.__mf(`${this.category}.${this.name}.card.description`, {
                work: toStatus(userData.catchDankMsg),
                farm: toStatus(userData.catchFarmMsg),
                npc: toStatus(userData.catchNPCSummonMsg)
            }))
            .setColor(0x00FF80)
            .setFooter({
                text: ie.__mf(`${this.category}.${this.name}.card.footer`),
                iconURL: ctx.author.avatarURL()
            })
            .setTimestamp();

        return ctx.reply({ embeds: [myInfoCard] }).then(msg => {
            deleteMessageSafe(msg, 60 * 1e3);
        });
    }
};