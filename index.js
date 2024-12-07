const { GatewayIntentBits, Client, Collection } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent]
});

require('dotenv').config();
client.login(process.env.TOKEN);

client.commands = new Collection;
client.aliases = new Collection;
client.cooldowns = new Collection;
client.categorys = new Collection;

['event', 'command'].forEach((handler) => {
  const callHandler = require(`./handlers/${handler}`);
  callHandler(client);
});
