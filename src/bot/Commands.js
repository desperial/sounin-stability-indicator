const Discord = require('discord.js');
const sosi = new Discord.Client();
const config = require('../config.json');
const lines = require('../lines.json');
const ytdl = require('ytdl-core');
const fs = require("fs");
const Statistic = require('../bot/Statistic');
const Model = require('../models');
const snekfetch = require('snekfetch');

var commands = {
  "help": {
    description: "Список команд, их описание и методы использования.",
    params:{
      "cmd":{
        description:"команды через пробел, о которых Вам хочется что-то узнать",
        required:false
      },
    },
    process: (bot, msg, souninId, params) => {
      var helpText = `##SoSI-HUI: Sounin Stability Indicator - Helping User Interface\n\n`;
      if(params.length>0){
        params.forEach((val, ind, arr)=>{
          var commandHelp = Object.keys(commands).find((val2find)=>{
            return val2find===val
          });

          if(commandHelp){
            var paramsHelp ='';
            if(commands[commandHelp].params){
              Object.keys(commands[commandHelp].params).forEach((valP,indP,arrP) => {
                paramsHelp += commands[commandHelp].params[valP].required===true?`<${valP}> `:`[${valP}] `;
              })
            }
            var cmdString = `\n${commandHelp} ${paramsHelp}\n`;
            var markdownEqalSign = '=';
            helpText += cmdString;
            helpText += markdownEqalSign.repeat(cmdString.length-2) + '\n';
            helpText += commands[commandHelp].description + '\n\n';

            if(commands[commandHelp].params){
              paramsHelp = '';
              helpText += 'Параметры:\n'
              Object.keys(commands[commandHelp].params).forEach((valP,indP,arrP) => {
                paramsHelp += `[${indP+1}]: ${valP}: ${commands[val].params[valP].required===true?`(обязательный)`:`(опциональный)`} ${commands[val].params[valP].description}\n`
              })
            }

            helpText += paramsHelp;

            if(commands[commandHelp].usage){
              helpText += '\nПример использования:\n\n'
              helpText += commands[commandHelp].usage
            }
            
          }
        })

        helpText += "Можете звездануть бота на GitHub: https://github.com/desperial/sounin-stability-indicator";
        return msg.channel.send(helpText, {code: 'markdown'})
      }else{
        Object.keys(commands).forEach((val,ind,array) => {
          var paramsHelp = '';
          if(commands[val].params){
            Object.keys(commands[val].params).forEach((valP,indP,arrP) => {
              paramsHelp += commands[val].params[valP].required===true?`<${valP}> `:`[${valP}] `;
            })
          }
          helpText += `[${ind+1}]: ${config.prefix}${val} ${paramsHelp}\n`
          helpText += `${commands[val].description}\n\n`;
        });
        helpText += "Можете звездануть бота на GitHub: https://github.com/desperial/sounin-stability-indicator";
        return msg.channel.send(helpText, {code: 'markdown'})
      }
    }
  },

  "prefix":{
    description: "Меняет префикс бота.",
    params:{
      "new prefix":{
        description:"Новый префикс бота",
        required:true
      },
    },
    usage: `${config.prefix}prefix Zaloopa\n>Теперь команды бота необходимо вводить:Zaloopahelp prefix. Вопрос лишь один. Зачем?`,
    process: (bot, msg, souninId, params)=>{
      var newPrefix = params[0];
      config.prefix = newPrefix;
      fs.writeFile("./src/config.json", JSON.stringify(config), (err) => console.error);
      return msg.reply(`Префикс изменен на ${newPrefix}. ${lineRandom(lines.prefixChange)}`);
    }
  },
  
  "check-last-leave":{
    description:`Выводит последний таймстамп лива Соунина по часовому поясу +5 GMT и количество дней, которые он продержался. Почему, скажем, не по МСК?
     \"Это потому что в жоже не было станда про часовые пояса или про Гринвич\" (С) Pickleman.`,
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
    process: function(bot,msg,souninId, params){
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
    usage: `... ну так просто напиши: ${config.prefix}kisya`,
    process: async (bot,msg,souninId, params)=> {
      const { body } = await snekfetch.get('https://aws.random.cat/meow');
      return msg.channel.send(body.file);
    }
  },

  "owl":{
    description: `А совушку хочешь?
  ,     ,
  )\\___/(
  {(@)v(@)}`,
  usage: `... ну так просто напиши: ${config.prefix}owl`,
    process: async (bot,msg,souninId, params)=> {
      const { body } = await giphyApi('owls birds');
      return msg.channel.send(body.data.image_original_url);
    }
  },

  "pickrandom":{
    description: `Хочешь чего-то ещё (например, пиздюлей) а отдельной команды нет?\n Вот она!`,
    params:{
      "tag":{
        description:"Теги через пробел, по которым будет выдаваться случайная картинка.",
        required:true
      },
    },
    process: async (bot,msg,souninId, params)=>{
      if(params.length<1){
        msg.reply(lineRandom(lines.giphyNoTags))
      }else{
        var tags = '';
        params.forEach((valP,indP,arrP) => {tags+=valP; indP===(params.length-1)?null:tags+=' '})
        console.log(tags.length, params.length);
        const { body } = await giphyApi(tags);
        if(body.data.image_original_url){
          return msg.channel.send(body.data.image_original_url);
        }else{
          return msg.reply(lineRandom(lines.giphyNotFound))
        }
      }
    }
  },
  
  "kazino":{
    description:"Тест яндекс.спичкита",
    process: async (bot,msg,souninId, params)=>{
      var channel = msg.member.voiceChannel
      const connection = await channel.join();
      var url = ySpeechRequest('Ебаный в рот этого казино');
      console.log(url);
      var dispatcher = connection.playArbitraryInput(url, )
      console.log(connection);
    }
  },

  "test":{
    description: `Пройди тест "Кто ты из таверны <<Розовый Дилдоэзреаль?>>.`,
    process: async (bot,msg,souninId, params)=>{
      msg.reply("Обрабатываем результат...");
      var identifyer = msg.author.id
      msg.reply(lines[identifyer]);
    }
  }
}

function lineRandom(linesArray) {
  randomizedIndex = Math.floor((Math.random() * linesArray.length));
  console.log(linesArray.length, randomizedIndex, linesArray[randomizedIndex])
  return linesArray[randomizedIndex];
}

async function giphyApi(query) {
  return await snekfetch.get(`http://api.giphy.com/v1/gifs/random?tag=${query}&api_key=${config.giphyKey}`);
}

function ySpeechRequest(text){
  return encodeURI(`https://tts.voicetech.yandex.net/generate?key=${config.yaSpeechKit}&text=${text}&format=opus&lang=ru-RU&speaker=oksana&speed=1&emotion=evil`)
}

module.exports = commands
