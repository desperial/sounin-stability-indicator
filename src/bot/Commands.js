const Discord = require('discord.js');
const sosi = new Discord.Client();
const config = require('../config.json');
const lines = require('../lines.json');
const fs = require("fs");
const leavingFixator = require('../bot/LeavingWatcher');
const Statistic = require('../bot/Statistic');

var commands = {
  "help": {
    description: "Список команд, их описание и методы использования.",
    process: function(){}
  },
  "check-last-leave":{
    description:"Выводит последний таймстамп лива Соунина по часовому поясу +5 GMT и количество дней, которые он продержался. Почему, скажем, не по МСК? \"*Это потому что в жоже не было станда про часовые пояса или про Гринвич*\" (С) Pickleman.",
    process: function(bot,msg,souninId){
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
    process: function(bot,msg,souninId){
      let leaveCount = new leavingFixator();
      let totalLeaves = leaveCount.countLeaves();
      console.log(leaveCount.countLeaves());
      msg.reply(`за время моей официальной работы было зафиксировано\r\n\
                ${totalLeaves} ливов\r\n\
                `);
    }
  },
  "update-statistic":{
    description: "-",
    process: function(bot,msg,souninId){
      let statistic = new Statistic();
      statistic.updateLeaves();
    }
  }
}

module.exports = commands
