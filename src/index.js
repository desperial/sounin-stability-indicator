const Discord = require('discord.js');
const sosi = new Discord.Client();
const config = require('./config.json');
const lines = require('./lines.json');
const fs = require("fs");
const commands = require('./bot/Commands');


sosi.login(config.token);

sosi.on('ready', () => {
  console.log('ready to serve!');

});

sosi.on('message', async (message) => {
  var command;
  var commandInput;
  var commandAction;
  var commandParams;
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
        console.log('Command not fount');
        message.reply('Нет такой команды. Если вы хотите её добавить... Ну, увы.')
    }
  }

  //
  if (message.content === 'Спасибо, бот.') {
    message.reply(lineRandom(lines.urWelcome));
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
