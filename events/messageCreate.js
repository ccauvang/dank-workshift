const { EmbedBuilder } = require('@discordjs/builders');
const { Collection } = require('discord.js');
const workProcess = require('../workprocess/processWorkMgs');
const { setLocale, ie } = require('../util/i18n');
const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: 'database/main.sqlite' });
const { timeFormat } = require('../util/timeFormat');
require('dotenv').config();

module.exports = async (client, message) => {
  if (message.author.id == client.user.id) return;
  if (!message.guild) return;
  if (message.author.id == '270904126974590976') {
    workProcess(message);
  };
  if (message.bot) return;


  let serverPrefix = await db.get(`Guild._${message.guild.id}.prefix`);
  if (serverPrefix == null) {
    serverPrefix = process.env.PREFIX;
  };

  let lang = await db.get(`Guild._${message.guild.id}.localLanguage`);
  if (lang == null) {
    lang = process.env.LANGUAGE;
  };

  setLocale(lang);

  let userStatus = await db.get(`User._${message.author.id}.catchDankMsg`);

  userStatus = (userStatus == 0 || userStatus == null) ? ie.__('common.Off') : ie.__('common.On');



  function escapeRegex(strInp) {
    return strInp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  };

  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(serverPrefix)})\\s{0,2}`);

  if (prefixRegex.test(message.content) == false) return;
  const spaceCheck = message.content.match(prefixRegex)[0].split(' ');

  if (spaceCheck.length > 2) return;
  const [matchedPrefix] = message.content.match(prefixRegex);

  const args = message.content.slice(matchedPrefix.length).trim().split(/\s+/);

  const commandName = args.shift().toLowerCase();

  if (commandName.length == 0 && matchedPrefix.includes(client.user.id)) {
    setTimeout(() =>
      message.delete().catch(error => {
        if (error.code == 10008) {
          console.error(`Error delete when they ping me.`);
        }
      }), 1500);

    const tagResponseCard = new EmbedBuilder()
      .setTitle(ie.__(`tagResponseCard.title`))
      .setDescription(ie.__mf(`tagResponseCard.description`, { serverPrefix: serverPrefix, userStatus: userStatus }))
      .setColor(0x00FF80)
      .setFooter({ text: ie.__(`tagResponseCard.footer`) })
      .setTimestamp();
    return message.channel.send({ embeds: [tagResponseCard] }).then(msg => setTimeout(() => msg.delete().catch(console.error), 1200000));
  };

  const command =
    client.commands.get(commandName) ||
    client.commands.get(client.aliases.get(commandName));

  if (!command) return;

  if (!client.cooldowns.has(command.name)) {
    client.cooldowns.set(command.name, new Collection());
  };

  const now = Date.now();
  const timestamps = client.cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 1) * 1e3;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1e3;

      setTimeout(() => {
        message.delete().catch(console.error);
      }, 2 * 1e3);

      const cooldownEmbed = new EmbedBuilder()
        .setTitle(ie.__mf('common.cooldownMessage', { cooldownTime: timeFormat(timeLeft.toFixed(0), lang) }))
        .setColor(0xFF0000);

      return message.channel.send({ embeds: [cooldownEmbed] }).then(msg => setTimeout(() => msg.delete().catch(console.error), 15 * 1e3));
    }
  } else {
    timestamps.set(message.author.id, now);
    setTimeout(() => {
      timestamps.delete(message.author.id)
    }, cooldownAmount);
  };

  try {
    setTimeout(() =>
      message.delete().catch(error => {
        if (error.code == 10008) {
          console.error(`Error delete \n User usage: ${message.author.id} \n Command: ${command.name}.`);
        }
      }), 2500);
    command.run(message, lang, args);
  } catch (error) {
    const errorEmbed = new EmbedBuilder()
      .setTitle(ie.__('common.errorCommand'))
      .setColor(0xFF0000);
    console.log(error);
    return message.channel.send({ embeds: [errorEmbed] }).then(msg => setTimeout(() => msg.delete().catch(console.error), 15000));
  }

  // await message.channel.send({ content: `${desMessage.data.description}` });
  // await message.channel.send({ embeds: [desMessage] });


};