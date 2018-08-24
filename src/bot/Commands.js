const Discord = require('discord.js');
const sosi = new Discord.Client();
const config = require('../config.json');
const lines = require('../lines.json');
const fs = require("fs");
const Statistic = require('../bot/Statistic');
const Model = require('../models');
const snekfetch = require('snekfetch');

var commands = {
  "help": {
    description: "Список команд, их описание и методы использования.",
    process: ()=>{}
  },
  "prefix":{
    description: "Меняет префикс бота.",
    params:['prefix'],
    process: (bot, msg, souninId, params)=>{
      var newPrefix = params[0];
      config.prefix = newPrefix;
      fs.writeFile("./src/config.json", JSON.stringify(config), (err) => console.error);
      return msg.reply(`Префикс изменен на ${newPrefix}. ${lineRandom(lines.prefixChange)}`);
    }
  },
  "check-last-leave":{
    description:`Выводит последний таймстамп лива Соунина по часовому поясу +5 GMT и количество дней, которые он продержался. Почему, скажем, не по МСК?
     \"*Это потому что в жоже не было станда про часовые пояса или про Гринвич*\" (С) Pickleman.`,
    process: function(bot,msg,souninId, params=[]){
      const sounin = msg.guild.members.get(souninId);
      if (sounin) {
        var souninLeft = sounin.joinedTimestamp;
        var souninLeftDate = new Date(souninLeft);
        var dd = souninLeftDate.getDate(); if (dd<10) dd='0'+dd;
        var mn = souninLeftDate.getMonth() + 1; if (mn<10) mn='0'+mn;
        var yy = souninLeftDate.getFullYear();
        var hh = souninLeftDate.getHours()-2; if (hh<10) hh='0'+hh;
        var mm = souninLeftDate.getMinutes(); if (mm<10) mm='0'+mm;
        const daysSinceSouninLeft = Math.floor((Date.now() - souninLeft) / (1000 * 60 * 60 * 24));
        msg.author.id===souninId
          ?msg.reply(`Я видел, как ты ливанул ${daysSinceSouninLeft} дней назад. ${dd}-${mn}-${yy}, в ${hh}:${mm} по МСК, если быть точным. Я за тобой слежу.`,  {
            files: ['https://images.stopgame.ru/uploads/images/310474/form/2014/09/08/1410183332.jpg']
          })
          :msg.reply(`В последний раз соунин ливнул ${dd}-${mn}-${yy}, в ${hh}:${mm} по МСК. Это было ${daysSinceSouninLeft} дней назад`)
      } else {
        msg.reply("Соунин уже сделал это. Сделал нечто, для чего был изначально рождён.");
      }
    }
  },
  "statistic":{
    description: "Статистика по ливам Соунина",
    process: function(bot,msg,souninId, params=[]){
      var statisticModel = Model('Statistic');
     
      statisticModel.findOne({}, (err,doc) => {
        const sounin = msg.guild.members.get(souninId);
        if (sounin) {
          var souninLeft = sounin.joinedTimestamp;
          var daysSinceSouninLeft = Math.floor((Date.now() - souninLeft) / (1000 * 60 * 60 * 24));
  
        }
        msg.reply(`за время моей официальной работы было зафиксировано ${doc.leavesCount} ливов\r\n\
            Рекордный срок нахождения Соунина на сервере из зафиксированных:\r\n\
              ${Math.floor(doc.maxStabilityDurationWeeks)} недель \r\n\
              ... это ${Math.floor(doc.maxStabilityDurationDays)} дней \r\n\
              ... это ${Math.floor(doc.maxStabilityDurationHours)} часов \r\n\
            Поскольку Соунин ещё не ливнул, его нынешний результат в ${daysSinceSouninLeft} дней ${(daysSinceSouninLeft>doc.maxStabilityDurationDays)?'(идет на рекорд, кстати!)':''} в учет не взят
        `);
      });
      
    }
  },
  "kisya":{
    description: `Хочешь кисю?
     人____人
    ≧(◕ ‿‿ ◕)≦`,
    process: async (bot,msg,souninId, params=[])=> {
      const { body } = await snekfetch.get('https://aws.random.cat/meow');
      return msg.channel.send(body.file);
    }
  },
  "huisya":{
    description: ``,
    process: (bot,msg,souninId, params=[])=>{
      msg.channel.send('k',{files:['https://dl.backbook.me/full/0efb3dead1.jpg']})
    }
  },
  "update-statistic":{
    description: "-",
    process: function(bot,msg,souninId, params=[]){
      let statistic = new Statistic();
      statistic.updateLeaves();
    }
  },
  "appologies":{
    description: "-",
    process: function(bot,msg,souninId, params=[]){
      const jorniyal = bot.channels.get(config.channelId);
      // console.log(jorniyal)
      jorniyal.send('Соунин, пусечка, прости! У меня БД обвалилась!', {
        files: ['https://cdn.discordapp.com/attachments/160365561631473665/472694579246923777/community_image_1408969951.gif']
      });
    }
  }
}

function lineRandom(linesArray) {
  randomizedIndex = Math.floor((Math.random() * linesArray.length));
  console.log(linesArray.length, randomizedIndex, linesArray[randomizedIndex])
  return linesArray[randomizedIndex];
}

module.exports = commands
