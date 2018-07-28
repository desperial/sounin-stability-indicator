const Discord = require('discord.js');
const sosi = new Discord.Client();
const config = require('./config.json');
const lines = require('./lines.json');
const fs = require("fs");
const leavingFixator = require('./models/Leaving');

sosi.login(config.token);

sosi.on('ready', ()=>{

});

sosi.on('message',(message)=>{

  if(message.content.startsWith(config.prefix + "prefix")) {
    let newPrefix = message.content.split(" ").slice(1, 2)[0];
    config.prefix = newPrefix;
    fs.writeFile("./src/config.json", JSON.stringify(config), (err) => console.error);
    message.reply("Префикс изменен на "+newPrefix+ " "+lineRandom(lines.prefixChange));
  }

  if(message.content == config.prefix + 'check-last-leave'){
    const sounin = message.guild.members.get(config.souninId);
    if (sounin){
      const souninLeft = sounin.joinedTimestamp;
      const daysSinceSouninLeft = Math.floor((Date.now() - souninLeft) / (1000*60*60*24));
      message.reply("В последний раз соунин ливнул "+ sounin.joinedAt + ". Это было "+ daysSinceSouninLeft + " дней назад");
    }else{
      message.reply("Соунин уже сделал это. Сделал нечто, для чего был изначально рождён.");
    }
  }
  else if(message.content == config.prefix + 'set-sounin-roles'){
    const sounin = message.guild.members.get(config.souninId);
    sounin.setRoles(config.souninRoles)
        .then(console.log())
        .catch(console.error);
    message.reply("Соунин, получите Ваши роли и пройдите в камеру.");
  }

});
sosi.on('guildMemberRemove',(member)=>{
  if(member.id == config.souninId){
    var souninJoined = member.joinedTimestamp;
    const daysSinceSouninLeft = Math.floor((Date.now() - souninJoined) / (1000*60*60*24));
    const jorniyal = sosi.channels.get(config.channelId);
    let newLeave = new leavingFixator({
      start: souninJoined,
      end: Date.now(),
    });
    newLeave.save();
    jorniyal.send('Соунин продержался '+ daysSinceSouninLeft + ' дней и ливнул. Тимми, обновляй счетчик.', {
      files:['https://media.giphy.com/media/rl0FOxdz7CcxO/giphy.gif']
    });
  }
});
sosi.on("guildMemberAdd", (member) => {
  if(member.id == config.souninId){
    const jorniyal = sosi.channels.get(config.channelId);
    jorniyal.send('Ой, смотрите-ка, кто вернулся!', {
      files:['https://cdn.discordapp.com/attachments/160365561631473665/472694579246923777/community_image_1408969951.gif']
    });
  }
});

function lineRandom(linesArray) {
  randomizedIndex = Math.floor((Math.random() * linesArray.length));
  console.log(linesArray.length, randomizedIndex,linesArray[randomizedIndex])
  return linesArray[randomizedIndex];
}
