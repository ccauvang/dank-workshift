const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder } = require('@discordjs/builders');
const { PermissionsBitField, MessageFlags, ComponentType } = require('discord.js');
const { setLocale, ie } = require('../../util/i18n');
const deleteMessageSafe = require('../../util/deleteMessage');
const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: 'database/main.sqlite' });

module.exports = {
    async run(ctx, lang) {
        setLocale(lang);

        const nonPermissionCard = new EmbedBuilder()
            .setTitle(ie.__(`${this.category}.${this.name}.nonPermissionCard.title`))
            .setDescription(ie.__(`${this.category}.${this.name}.nonPermissionCard.description`))
            .setColor(0xFF0000);

        if (!ctx.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            ctx.reply({ embeds: [nonPermissionCard] }).then(msg => {
                deleteMessageSafe(msg, 15 * 1e3);
            });
            return;
        };

        const languageOptions = [
            {
                label: ie.__(`${this.category}.${this.name}.languageOptions.en.label`),
                description: ie.__(`${this.category}.${this.name}.languageOptions.en.description`),
                value: 'en'
            },
            {
                label: ie.__(`${this.category}.${this.name}.languageOptions.vi.label`),
                description: ie.__(`${this.category}.${this.name}.languageOptions.vi.description`),
                value: 'vi'
            }
        ];

        const localOfServer = await db.get(`Guild._${ctx.guildId}.localLanguage`) || process.env.LANGUAGE;

        const setLanguageMenu = new StringSelectMenuBuilder()
            .setCustomId('setLangMenu')
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder(ie.__(`${this.category}.${this.name}.setLangMenu.placeholder`))

        languageOptions.forEach((locale) => {
            if (locale.value != localOfServer) {
                const setLanguageMenuOption = new StringSelectMenuOptionBuilder()
                    .setLabel(locale.label)
                    .setDescription(locale.description)
                    .setValue(locale.value);

                setLanguageMenu.addOptions(setLanguageMenuOption);
            };
        });

        const setLanguageActionRow = new ActionRowBuilder()
            .addComponents(setLanguageMenu);

        const buildLanguageContainer = (titleKey, descKey, descData, includeMenu = true) => {
            const container = new ContainerBuilder()
                .setAccentColor(0x00FF80)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `**${ie.__(`${this.category}.${this.name}.${titleKey}`)}**\n` +
                        ie.__mf(`${this.category}.${this.name}.${descKey}`, descData)
                    )
                );
            if (includeMenu) {
                container.addSeparatorComponents(new SeparatorBuilder()).addActionRowComponents(setLanguageActionRow);
            }
            return container;
        };

        const setLanguageMessage = await ctx.reply({
            components: [buildLanguageContainer('setLanguageCard.title', 'setLanguageCard.description', { currentLanguage: localOfServer })],
            flags: MessageFlags.IsComponentsV2
        });

        function filler(i) {
            return ctx.author.id == i.user.id;
        };

        const collector = await setLanguageMessage.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 120 * 1e3,
        });

        collector.on('collect', async (menuInteraction) => {
            if (!filler(menuInteraction)) {
                await menuInteraction.reply({ content: ie.__(`common.isntYour`), flags: MessageFlags.Ephemeral });
                return;
            };

            if (!ctx.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                menuInteraction.reply({ embeds: [nonPermissionCard], flags: MessageFlags.Ephemeral });
                return;
            };

            const languageUserChoose = menuInteraction.values[0];

            await db.set(`Guild._${menuInteraction.guildId}.localLanguage`, languageUserChoose);

            await menuInteraction.update({
                components: [buildLanguageContainer('setLanguageSuccessCard.title', 'setLanguageSuccessCard.description', { setLang: languageUserChoose }, false)],
                flags: MessageFlags.IsComponentsV2
            });

            collector.resetTimer({ time: 60 * 1e3 });
            return;
        });

        collector.on('end', () => {
            deleteMessageSafe(setLanguageMessage, 5 * 1e3);
        });
    }
};