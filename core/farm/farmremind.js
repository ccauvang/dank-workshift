// core/farm/farmremind.js
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder } = require('@discordjs/builders');
const { MessageFlags, ComponentType, ButtonStyle } = require('discord.js');
const { setLocale, ie } = require('../../util/i18n');
const deleteMessageSafe = require('../../util/deleteMessage');
const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: 'database/main.sqlite' });

module.exports = {
    async run(ctx, lang) {
        setLocale(lang);

        const userStatus = await db.get(`User._${ctx.author.id}.catchFarmMsg`);

        const newUserCard = new EmbedBuilder()
            .setTitle(ie.__(`${this.category}.${this.name}.newUserCard.title`))
            .setColor(0x00FF80);

        const setFRButtonEnable = new ButtonBuilder()
            .setCustomId(`setFR:${ctx.author.id}:enable`)
            .setLabel(ie.__('common.Enable'))
            .setStyle(ButtonStyle.Success);

        const setFRButtonDisable = new ButtonBuilder()
            .setCustomId(`setFR:${ctx.author.id}:disable`)
            .setLabel(ie.__('common.Disable'))
            .setStyle(ButtonStyle.Danger);

        if (userStatus == null || userStatus == 0) {
            setFRButtonDisable.setDisabled(true);
        } else {
            setFRButtonEnable.setDisabled(true);
        };

        const setFRActionRow = new ActionRowBuilder()
            .setComponents(setFRButtonDisable, setFRButtonEnable);

        const buildSettingContainer = (statusKey) => {
            return new ContainerBuilder()
                .setAccentColor(0x00FF80)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `**${ie.__(`${this.category}.${this.name}.settingCard.title`)}**\n` +
                        ie.__mf(`${this.category}.${this.name}.settingCard.description`, { status: ie.__(statusKey) })
                    )
                )
                .addSeparatorComponents(new SeparatorBuilder())
                .addActionRowComponents(setFRActionRow);
        };

        const farmRemindMessage = await ctx.reply({
            components: [buildSettingContainer(userStatus == 0 || userStatus == null ? 'common.Off' : 'common.On')],
            flags: MessageFlags.IsComponentsV2
        });

        function filter(i) {
            return ctx.author.id == i.user.id;
        };

        const collector = farmRemindMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 120 * 1e3
        });

        let checkNull = true;

        collector.on('collect', async (buttonInteraction) => {
            if (!filter(buttonInteraction)) {
                buttonInteraction.reply({ content: ie.__(`common.isntYour`), flags: MessageFlags.Ephemeral })
                return;
            };

            if (buttonInteraction.customId == `setFR:${buttonInteraction.user.id}:enable`) {
                await db.set(`User._${buttonInteraction.user.id}.catchFarmMsg`, 1);
                setFRButtonEnable.setDisabled(true);
                setFRButtonDisable.setDisabled(false);

                if (userStatus == null && checkNull) {
                    checkNull = false;
                    await buttonInteraction.reply({ embeds: [newUserCard], flags: MessageFlags.Ephemeral });
                    await farmRemindMessage.edit({ components: [buildSettingContainer('common.On')], flags: MessageFlags.IsComponentsV2 });
                } else {
                    await buttonInteraction.update({ components: [buildSettingContainer('common.On')], flags: MessageFlags.IsComponentsV2 });
                };

                collector.resetTimer({ time: 60 * 1e3 });
            };

            if (buttonInteraction.customId == `setFR:${buttonInteraction.user.id}:disable`) {
                await db.set(`User._${buttonInteraction.user.id}.catchFarmMsg`, 0);
                setFRButtonDisable.setDisabled(true);
                setFRButtonEnable.setDisabled(false);

                await buttonInteraction.update({ components: [buildSettingContainer('common.Off')], flags: MessageFlags.IsComponentsV2 });

                collector.resetTimer({ time: 60 * 1e3 });
            };
        });

        collector.on('end', () => {
            deleteMessageSafe(farmRemindMessage, 5 * 1e3);
        });
    }
};