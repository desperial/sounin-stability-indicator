const Discord = require('discord.js');
const sosi = new Discord.Client();
const config = require('./config.json');
const lines = require('./lines.json');
const fs = require("fs");
const evaNames = require("./eva_nicnames/last_nickchange.json");
const evaChanges = require("./eva_nicnames/changes.json");
const commands = require('./bot/Commands');
const CronJob = require('cron').CronJob;

var goodmorning = new CronJob('0 0 7 * * *', function() {
    const johnyral = sosi.channels.get(config.channelId);
    johnyral.send(`Доброе утро, чатик! :3`);
}, null, true, 'Europe/Moscow');


sosi.login(config.token);

sosi.on('ready', () => {
  console.log('ready to serve!');
});

sosi.on('message', async (message) => {
  var command;
  var commandInput;
  var commandAction;
  var commandParams;
  const sounin = await sosi.fetchUser(config.souninId);
  if (message.content.startsWith(config.prefix)){
    commandInput = message.content.split(config.prefix).slice(1)[0];
    commandAction = commandInput.split(" ").slice(0)[0];
    commandParams =  commandInput.split(" ").slice(1);
    console.log(`
      Author: ${message.author.username}
      Time: ${message.createdAt}
      Action: ${commandAction?commandAction:'<none>'}
      Params: ${commandParams.length>0?commandParams:'<none>'}
    `);
  }
  if (commandAction){
      command = Object.keys(commands).find((val)=>{
      return val===commandAction
    });
    try {
      commands[command].process(sosi,message,config.souninId,commandParams)
    }catch(err){
        console.log(err);
        console.log('Command not fount');
        message.reply('Нет такой команды. Если вы хотите её добавить... Ну, увы.')
    }
  }

  //
  if (message.content === 'Спасибо, бот.') {
    message.reply(lineRandom(lines.urWelcome));
  }

  if (message.channel === sounin.dmChannel){
    console.log(message.content)
  }
});

sosi.on('guildMemberUpdate', (oldMember, newMember) => {
  if ((oldMember.id === config.evaId) && (oldMember.nickname != newMember.nickname)){
    var oldNick = oldMember.nickname?oldMember.nickname:oldMember.user.username;
    var newNick = newMember.nickname?newMember.nickname:newMember.user.username;
    const johnyral = sosi.channels.get(config.channelId);
    johnyral.send(`Ева сменила ник с ${oldNick} на ${newNick}. Я всё записал. :3`);
    evaNames.counter++;
    evaNames.old = oldNick;
    evaNames.new = newNick;

    evaChanges[Date.now()] = {
      old : oldNick,
      new : newNick
    }

    fs.writeFile('./src/eva_nicnames/last_nickchange.json', JSON.stringify(evaNames), (err) => console.error);
    fs.writeFile('./src/eva_nicnames/changes.json', JSON.stringify(evaChanges), (err) => console.error);

  }
});

sosi.on('guildMemberRemove', (member) => {
  if (member.id == config.souninId) {
    var souninJoined = member.joinedTimestamp;
    const daysSinceSouninLeft = Math.floor((Date.now() - souninJoined) / (1000 * 60 * 60 * 24));
    const jorniyal = sosi.channels.get(config.channelId);
    var newLeave = {
      "start": souninJoined,
      "end": Date.now(),
    };
    fs.writeFile('./src/last-leave.json', JSON.stringify(newLeave), (err) => console.error);
    fs.writeFile(`./src/leaves/leave-${new Date()}.json`, JSON.stringify(newLeave), (err) => console.error);
    jorniyal.send('Соунин продержался ' + daysSinceSouninLeft + ' дней и ливнул. Тимми, обновляй счетчик.', {
      files: ['https://media.giphy.com/media/rl0FOxdz7CcxO/giphy.gif']
    });
  }
});

sosi.on("guildMemberAdd", (member) => {
  if (member.id == config.souninId) {
    const jorniyal = sosi.channels.get(config.channelId);
    jorniyal.send(`
    Ой, смотрите-ка, кто вернулся!
    Только знаешь, что? Мейда тебя встречать не будет. Ты её забрал.`, {
      files: ['https://s1.ax1x.com/2018/06/25/PCYYiq.jpg']
    });
  }
});

function lineRandom(linesArray) {
  randomizedIndex = Math.floor((Math.random() * linesArray.length));
  console.log(linesArray.length, randomizedIndex, linesArray[randomizedIndex])
  return linesArray[randomizedIndex];
}
