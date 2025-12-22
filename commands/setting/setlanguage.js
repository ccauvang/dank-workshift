const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('@discordjs/builders');
const { PermissionsBitField, MessageFlags, TextInputStyle, ComponentType } = require('discord.js');
const { setLocale, ie } = require('../../util/i18n');
const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: "database/main.sqlite" });
require('dotenv').config();

module.exports = {
    name: 'setlanguage',
    aliases: ['setlocale', 'lang', 'setlang'],
    description: 'setting.setlanguage.description',
    cooldown: 10,
    category: __dirname.split(/(\\|\/)/).pop(), // name of the folder
    usage: ['^setlanguage', '^setlocal'],
    async run(message, lang) {
        setLocale(lang);

        const nonPermissionCard = new EmbedBuilder()
            .setTitle(ie.__(`${this.category}.${this.name}.nonPermissionCard.title`))
            .setDescription(ie.__(`${this.category}.${this.name}.nonPermissionCard.description`))
            .setColor(0xFF0000);

        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            message.channel.send({ embeds: [nonPermissionCard] }).then(msg => {
                setTimeout(() => {
                    msg.delete().catch(console.error);
                }, 15 * 1e3);
            });
            return;
        };

        const languageOptions = [
            {
                // en
                label: ie.__(`${this.category}.${this.name}.languageOptions.en.label`),
                description: ie.__(`${this.category}.${this.name}.languageOptions.en.description`),
                value: 'en'
            },
            {
                // vi
                label: ie.__(`${this.category}.${this.name}.languageOptions.vi.label`),
                description: ie.__(`${this.category}.${this.name}.languageOptions.vi.description`),
                value: 'vi'
            }
        ];

        const localOfServer = await db.get(`Guild._${message.guild.id}.localLanguage`) || process.env.LANGUAGE;

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

        const setLanguageCard = new EmbedBuilder()
            .setTitle(ie.__(`${this.category}.${this.name}.setLanguageCard.title`))
            .setDescription(ie.__mf(`${this.category}.${this.name}.setLanguageCard.description`, { currentLanguage: localOfServer }))
            .setColor(0x00FF80)
            .setFooter({
                text: ie.__mf(`${this.category}.${this.name}.setLanguageCard.footer`, {
                    tag: message.author.tag
                }),
                iconURL: message.author.avatarURL()
            })
            .setTimestamp();

        const setLanguageMessage = await message.channel.send({ embeds: [setLanguageCard], components: [setLanguageActionRow] });

        function filler(i) {
            return message.author.id == i.user.id;
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

            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                menuInteraction.reply({ embeds: [nonPermissionCard], flags: MessageFlags.Ephemeral });
                return;
            };

            const languageUserChoose = menuInteraction.values[0];

            await db.set(`Guild._${message.guildId}.localLanguage`, languageUserChoose);

            const setLanguageSuccessCard = new EmbedBuilder()
                .setTitle(ie.__(`${this.category}.${this.name}.setLanguageSuccessCard.title`))
                .setDescription(ie.__mf(`${this.category}.${this.name}.setLanguageSuccessCard.description`, { setLang: languageUserChoose }))
                .setColor(0x00FF80)
                .setFooter({
                    text: ie.__mf(`${this.category}.${this.name}.setLanguageSuccessCard.footer`,
                        {
                            tag: message.author.tag
                        }),
                    iconURL: message.author.avatarURL()
                });

            await menuInteraction.update({ embeds: [setLanguageSuccessCard], components: [] });

            collector.resetTimer({ time: 60 * 1e3 });
            return;
        });

        collector.on('end', () => {
            setTimeout(() => {
                setLanguageMessage.delete().catch(console.error);
            }, 2 * 1e3)
        });

    }
};