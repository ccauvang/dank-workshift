const { EmbedBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, LabelBuilder, ActionRowBuilder } = require('@discordjs/builders');
const { PermissionsBitField, MessageFlags, TextInputStyle, ComponentType } = require('discord.js');
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
            ctx.reply({ embeds: [nonPermissionCard] }).then(msg => deleteMessageSafe(msg, 15 * 1e3));
            return;
        };

        const defaultPrefix = process.env.PREFIX;

        const setPrefixButton = new ButtonBuilder()
            .setCustomId('setPreBtn')
            .setLabel('Set prefix')
            .setStyle('Success');

        const resetPrefixButton = new ButtonBuilder()
            .setCustomId('resetPreBtn')
            .setLabel('Reset prefix')
            .setStyle('Primary');

        const setPrefixButtonRow = new ActionRowBuilder()
            .addComponents(setPrefixButton);

        const currentPrefix = await db.get(`Guild._${ctx.guildId}.prefix`);

        if (currentPrefix != null && currentPrefix != defaultPrefix) {
            setPrefixButtonRow.addComponents(resetPrefixButton);
        };

        const setPrefixInput = new TextInputBuilder()
            .setCustomId('setPreInp')
            .setPlaceholder('ex: #.')
            .setStyle(TextInputStyle.Short)
            .setMaxLength(3)
            .setMinLength(1)
            .setRequired(true);

        const setPrefixLabel = new LabelBuilder()
            .setLabel('Prefix:')
            .setTextInputComponent(setPrefixInput);

        const setPrefixModal = new ModalBuilder()
            .setCustomId(`setPrefixModal_${ctx.author.id}`)
            .setTitle(ie.__(`${this.category}.${this.name}.setPrefixModal.title`))
            .addLabelComponents(setPrefixLabel);

        const setPrefixCard = new EmbedBuilder()
            .setTitle(ie.__(`${this.category}.${this.name}.setPrefixCard.preview.title`))
            .setDescription(ie.__mf(`${this.category}.${this.name}.setPrefixCard.preview.description`, { currentPrefix: currentPrefix }))
            .setColor(0x00FF80)
            .setFooter({ text: ie.__mf(`${this.category}.${this.name}.setPrefixCard.preview.footer`, { tag: ctx.author.tag }), iconURL: ctx.author.avatarURL() })
            .setTimestamp();

        const setPrefixMessage = await ctx.reply({ embeds: [setPrefixCard], components: [setPrefixButtonRow] });

        function filter(i) {
            return ctx.author.id == i.user.id
        };

        const collector = setPrefixMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 120 * 1e3
        });

        let canAddAwaitModal = true;
        let endCollector = false;

        collector.on('collect', async (buttonInteraction) => {
            if (!filter(buttonInteraction)) {
                buttonInteraction.reply({ content: ie.__(`common.isntYour`), flags: MessageFlags.Ephemeral })
                return;
            };

            if (!ctx.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                buttonInteraction.reply({ embeds: [nonPermissionCard], flags: MessageFlags.Ephemeral });
                return;
            };

            if (buttonInteraction.customId == 'setPreBtn') {
                await buttonInteraction.showModal(setPrefixModal);
                if (canAddAwaitModal) {
                    canAddAwaitModal = false;

                    await buttonInteraction.awaitModalSubmit({ filter, time: 140 * 1e3 })
                        .then(async (modalInteraction) => {
                            canAddAwaitModal = true;
                            if (endCollector == false) {
                                const prefixReceive = await modalInteraction.fields.getTextInputValue('setPreInp');
                                await db.set(`Guild._${modalInteraction.guildId}.prefix`, prefixReceive);

                                setPrefixCard.setTitle(ie.__(`${this.category}.${this.name}.setPrefixCard.success.title`))
                                setPrefixCard.setDescription(ie.__mf(`${this.category}.${this.name}.setPrefixCard.success.description`, { prefix: prefixReceive }))
                                setPrefixCard.setFooter({
                                    text: ie.__mf(`${this.category}.${this.name}.setPrefixCard.success.footer`, {
                                        tag: modalInteraction.user.tag,
                                    }),
                                    iconURL: modalInteraction.user.avatarURL()
                                })

                                await modalInteraction.update({ embeds: [setPrefixCard], components: [] });

                                collector.resetTimer({ time: 60 * 1e3 });
                            } else {
                                modalInteraction.reply({ content: 'Yooo what do you find bro.', flags: MessageFlags.Ephemeral })
                            };
                        })
                        .catch(err => {
                            canAddAwaitModal = true;
                            console.log(err);
                            collector.stop();
                        });
                };
                return;
            };

            if (buttonInteraction.customId == 'resetPreBtn') {
                const resetPrefixCard = new EmbedBuilder()
                    .setTitle(ie.__(`${this.category}.${this.name}.resetPrefixCard.title`))
                    .setDescription(ie.__mf(`${this.category}.${this.name}.resetPrefixCard.description`, { defaultPrefix: defaultPrefix }))
                    .setColor(0x00FF80)
                    .setFooter({ text: ie.__mf(`${this.category}.${this.name}.resetPrefixCard.footer`, { tag: ctx.author.tag }), iconURL: ctx.author.avatarURL() })
                    .setTimestamp();

                await buttonInteraction.update({ embeds: [resetPrefixCard], components: [] });

                await db.set(`Guild._${buttonInteraction.guildId}.prefix`, defaultPrefix)
                collector.resetTimer({ time: 60 * 1e3 });
                return;
            }
        });

        collector.on('end', async () => {
            endCollector = true;
            deleteMessageSafe(setPrefixMessage, 5 * 1e3);
        });
    }
};