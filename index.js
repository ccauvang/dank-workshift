const { GatewayIntentBits, Client } = require('discord.js');
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

/* client.on('messageUpdate', async (message) => {
  if (message.author.id == '991659384776183928') return;
  console.log('update');

  var desMessage = 'Nothing';

  if (message.embeds.length >= 1) {
    desMessage = message.embeds[0].data.description;
  };

  await message.channel.send({ content: `${desMessage}` });

}); */

['event'].forEach((handler) => {
  const callHandler = require(`./handlers/${handler}`);
  callHandler(client);
});
