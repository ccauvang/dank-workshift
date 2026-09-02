const { EmbedBuilder } = require('@discordjs/builders');
const { Collection, MessageFlags } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: 'database/main.sqlite' });
const { setLocale, ie } = require('../util/i18n');
const { timeFormat } = require('../util/timeFormat');

module.exports = async (client, interaction) => {
    if (interaction.isAutocomplete()) {
        const command = client.slashCommands.get(interaction.commandName);
        if (!command || !command.autocomplete) return;

        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.log(error);
        }
        return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    var lang = await db.get(`Guild._${interaction.guildId}.localLanguage`);
    if (lang == null) lang = process.env.LANGUAGE;

    setLocale(lang);

    if (!client.cooldown.has(command.name)) {
        client.cooldown.set(command.name, new Collection());
    };

    const now = Date.now();
    const timestamps = client.cooldown.get(command.name);
    const cooldownAmount = (command.cooldown || 1) * 1e3;

    if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1e3;

            const cooldownEmbed = new EmbedBuilder()
                .setTitle(ie.__mf('common.cooldownMessage', { cooldownTime: timeFormat(timeLeft.toFixed(0), lang) }))
                .setColor(0xFF0000);

            return interaction.reply({ embeds: [cooldownEmbed], flags: MessageFlags.Ephemeral });
        }
    } else {
        timestamps.set(interaction.user.id, now);
        setTimeout(() => {
            timestamps.delete(interaction.user.id)
        }, cooldownAmount);
    };

    try {
        await command.run(interaction, lang);
    } catch (error) {
        const errorEmbed = new EmbedBuilder()
            .setTitle(ie.__('common.errorCommand'))
            .setColor(0xFF0000);
        console.log(error);

        if (interaction.replied || interaction.deferred) {
            return interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
        }
        return interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
    }
};