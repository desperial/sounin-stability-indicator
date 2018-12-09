const Discord = require('discord.js');
const sosi = new Discord.Client();
const config = require('./config.json');
const lines = require('./lines.json');
const fs = require("fs");
const commands = require('./bot/Commands');
const CronJob = require('cron').CronJob;

var goodmorning = new CronJob('0 0 7 * * *', function() {
    const johnyral = sosi.channels.get(config.channelId);
    johnyral.send(`Доброе утро, чатик! :3`,{files: ['https://media.discordapp.net/attachments/160365561631473665/490599090124750858/IMG_20180916_000533.jpg']});
}, null, true, 'Europe/Moscow');


var http = require('http');
 
var port = process.env.PORT || 3000;
 
var s = http.createServer();
s.on('request', function(request, response) {
    response.writeHead(200);
    var data = '';
    request.on('data', function(chunk) {
        data += chunk.toString();
    });
    request.on('end', function() {
        console.log(data.data);
        if (!(data['data'] === undefined)){
          const channel = sosi.channels.get('170512752274702336');
          channel.send('Stream is on');

        }
        response.end();
    });
    request.on('error', function(err) {
      // Handle error
  });
});
 
s.listen(port);
console.log('Browse to http://127.0.0.1:' + port);


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
    jorniyal.send('И-и-и он снова это сделал.');
  }
});

sosi.on("guildMemberAdd", (member) => {
  if (member.id == config.souninId) {
    const jorniyal = sosi.channels.get(config.channelId);
    jorniyal.send(`<@${config.souninId}>
    `, {
      files: ['https://s1.ax1x.com/2018/06/25/PCYYiq.jpg']
    });
  }
});

sosi.on('error', console.error);

function lineRandom(linesArray) {
  randomizedIndex = Math.floor((Math.random() * linesArray.length));
  console.log(linesArray.length, randomizedIndex, linesArray[randomizedIndex])
  return linesArray[randomizedIndex];
}
