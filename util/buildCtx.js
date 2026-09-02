function buildCtxFromMessage(message) {
    return {
        author: message.author,
        member: message.member,
        guild: message.guild,
        guildId: message.guild.id,
        channel: message.channel,
        client: message.client,
        reply: (opts) => message.channel.send(opts),
    };
}

function buildCtxFromInteraction(interaction) {
    return {
        author: interaction.user,
        member: interaction.member,
        guild: interaction.guild,
        guildId: interaction.guildId,
        channel: interaction.channel,
        client: interaction.client,
        reply: (opts) => interaction.channel.send(opts),
    };
}

module.exports = { buildCtxFromMessage, buildCtxFromInteraction };