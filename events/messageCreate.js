module.exports = async (client, message) => {
  if (message.author.id == client.user.id) return;
  if (message.author.id != '270904126974590976') return;
  if (message.interaction == null) return;
  if (message.embeds.length < 1) return;

  const embedOfMessage = message.embeds[0];
  const msgRootInteract = message.interaction;

  console.log(embedOfMessage);
  console.log(msgRootInteract);

  if (msgRootInteract.commandName == 'work shift') {
    await message.react('1313857088245731359');
    await message.channel.send({ embeds: [embedOfMessage] }).then(msg => {
      if (msg.deletable) {
        setTimeout(() => {
          msg.delete().catch(console.error);
          message.reactions.removeAll();
        }, 30 * 1e3);
      };
    });
  }

  /* [
    Embed {
      data: {
        type: 'rich',
        description: 'Look at each color next to the words closely!\n' +
          '<:Yellow:863886248296316940> `wander`\n' +
          '<:Green:863886248527134730> `ziplining`\n' +
          '<:Cyan:863886248670265392> `exertion`',
        content_scan_version: 0,
        color: 2829617
      }
    },
 
    Embed {
      data: {
        type: 'rich',
        description: 'Dunk the ball!\n' +
          ':wastebasket::wastebasket::wastebasket:\n' +
          '<:emptyspace:827651824739156030><:emptyspace:827651824739156030>:basketball:\n' +
          '\n' +
          '<:emptyspace:827651824739156030>:levitate:',
        content_scan_version: 0,
        color: 2829617
      }
    },
 
    Embed {
      data: {
        type: 'rich',
        description: 'Hit the ball!\n' +
          ':goal::goal::goal:\n' +
          '<:emptyspace:827651824739156030>:levitate:\n' +
          '\n' +
          '<:emptyspace:827651824739156030>:soccer:',
        content_scan_version: 0,
        color: 2829617
      }
    },
 
    
  ]
 */



  // await message.channel.send({ content: `${desMessage.data.description}` });
  // await message.channel.send({ embeds: [desMessage] });


};