const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('@discordjs/builders');
const { MessageFlags, ComponentType, ButtonStyle } = require('discord.js');
const { setLocale, ie } = require('../../util/i18n');
const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: 'database/main.sqlite' });

module.exports = {
    name: 'setworkcatch',
    aliases: ['swc', 'wc'],
    description: 'setting.setworkcatch.description',
    cooldown: 5,
    category: __dirname.split(/(\\|\/)/).pop(),
    usage: ['^setworkcatch', '^swc'],
    async run(message, lang) {
        setLocale(lang);

        const userStatus = await db.get(`User._${message.author.id}.catchDankMsg`);

        const newUserCard = new EmbedBuilder()
            .setTitle(ie.__(`${this.category}.${this.name}.newUserCard.title`))
            .setColor(0x00FF80);

        const setWCButtonEnable = new ButtonBuilder()
            .setCustomId(`setWC:${message.author.id}:enable`)
            .setLabel(ie.__('common.Enable'))
            .setStyle(ButtonStyle.Success);

        const setWCButtonDisable = new ButtonBuilder()
            .setCustomId(`setWC:${message.author.id}:disable`)
            .setLabel(ie.__('common.Disable'))
            .setStyle(ButtonStyle.Danger);

        if (userStatus == null || userStatus == 0) {
            setWCButtonDisable.setDisabled(true);
        } else {
            setWCButtonEnable.setDisabled(true);
        };

        const setWCActionRow = new ActionRowBuilder()
            .setComponents(setWCButtonDisable, setWCButtonEnable);

        const settingCard = new EmbedBuilder()
            .setTitle(ie.__(`${this.category}.${this.name}.settingCard.title`))
            .setDescription(ie.__mf(`${this.category}.${this.name}.settingCard.description`, {
                status: userStatus == 0 || userStatus == null ? ie.__('common.Off') : ie.__('common.On')
            }))
            .setColor(0x00FF80)
            .setTimestamp();

        const setWorkCatchMessage = await message.channel.send({ embeds: [settingCard], components: [setWCActionRow] });

        function filter(i) {
            return message.author.id == i.user.id;
        };

        const collector = setWorkCatchMessage.createMessageComponentCollector({
            // filter,
            componentType: ComponentType.Button,
            time: 120 * 1e3
        });

        let checkNull = true;

        collector.on('collect', async (buttonInteraction) => {

            if (!filter(buttonInteraction)) {
                buttonInteraction.reply({ content: ie.__(`common.isntYour`), flags: MessageFlags.Ephemeral })
                return;
            };


            if (buttonInteraction.customId == `setWC:${buttonInteraction.user.id}:enable`) {

                await db.set(`User._${buttonInteraction.user.id}.catchDankMsg`, 1);
                setWCButtonEnable.setDisabled(true);
                setWCButtonDisable.setDisabled(false);
                settingCard.setDescription(ie.__mf(`${this.category}.${this.name}.settingCard.description`, { status: ie.__('common.On') }));
                settingCard.setTimestamp();

                if (userStatus == null && checkNull) {
                    checkNull = false;
                    await buttonInteraction.reply({ embeds: [newUserCard], flags: MessageFlags.Ephemeral })
                    await setWorkCatchMessage.edit({ embeds: [settingCard], components: [setWCActionRow] });
                } else {
                    await buttonInteraction.update({ embeds: [settingCard], components: [setWCActionRow] });
                };

                collector.resetTimer({ time: 60 * 1e3 });
            };

            if (buttonInteraction.customId == `setWC:${buttonInteraction.user.id}:disable`) {
                await db.set(`User._${buttonInteraction.user.id}.catchDankMsg`, 0);
                setWCButtonDisable.setDisabled(true);
                setWCButtonEnable.setDisabled(false);
                settingCard.setDescription(ie.__mf(`${this.category}.${this.name}.settingCard.description`, { status: ie.__('common.Off') }));
                settingCard.setTimestamp();

                await buttonInteraction.update({ embeds: [settingCard], components: [setWCActionRow] });

                collector.resetTimer({ time: 60 * 1e3 });
            };

        });

        collector.on('end', () => {
            setTimeout(() => {
                setWorkCatchMessage.delete().catch(console.error);
            }, 5 * 1e3);
        });

    }
};