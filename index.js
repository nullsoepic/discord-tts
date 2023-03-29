const {
  Message,
  Client,
  MessageAttachment,
} = require('discord.js-selfbot-v13');
const gtts = require('better-node-gtts').default;
const { exec } = require('child_process');
const dvoice = require('@discordjs/voice');
const fs = require('fs');
const client = new Client({
  checkUpdate: false,
});

client.on('ready', () => {
  console.log(` = Logged in as ${client.user.tag}!`);
});

let connection;
let player;
let resource;

client.on('messageCreate', async (msg) => {
  //if (msg.author.id != devID) return;
  let args = msg.content.split(' ');
  if (msg.channel.id == msg.author.id) return;
  switch (args[0]) {
    case '=join':
      {
        const member = msg.member;
        if (!member.voice.channelId) return;

        connection = dvoice.joinVoiceChannel({
          channelId: member.voice.channel.id,
          guildId: msg.guild.id,
          adapterCreator: msg.guild.voiceAdapterCreator,
        });
        player = dvoice.createAudioPlayer();
        connection.subscribe(player);
        connection.on('error', (error) => {
          console.error(`Encountered error: ${error}`);
        });
      }
      break;
    case '=say':
      {
        console.log(`${msg.channel.name} ${msg.author.tag} | ${msg.content}`);
        if (args.length <= 1) return;
        let text = args.slice(1);

        // VOLUME

        let resv = 1;
        for (let i = 0; i < text.length; i++) {
          if (/^-v=[1-9][0-9]?[0-9]?[0-9]?[0-9]?$/.test(text[i])) {
            let numv = parseInt(text[i].split('=')[1]);
            if (isNaN(numv)) numv = 100;
            resv = numv / 100;
            console.log(resv);
            text.splice(i, 1);
            break;
          }
        }

        await gtts.save('./speech.wav', text.join(' ')).then(async () => {
          resource = dvoice.createAudioResource(`./speech.wav`, {
            inlineVolume: true,
          });
          resource.volume.setVolume(resv);

          player.play(resource);
        });
      }
      break;
  }
});

client.login(
  'funny.numbers.here'
);
