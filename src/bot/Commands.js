const Discord = require('discord.js');
const sosi = new Discord.Client();
const config = require('../config.json');
const lines = require('../lines.json');
const opus = require('node-opus');
const http = require('http');
const fs = require("fs");
const snekfetch = require('snekfetch');
const lastLeave = require('../last-leave.json');
const Trello = require("node-trello");
const curl = require("curl");


const trelloController = new Trello(config.trelloApi, config.trelloToken);

var commands = {
  "help": {
    descriptionShort: "Инфо о команде",
    description: "Список команд, их описание и методы использования.",
    params:{
      "cmd":{
        description:"команды через пробел, о которых Вам хочется что-то узнать",
        required:false
      },
    },
    process: (bot, msg, souninId, params) => {
      
      var embedData = {
        author: {
          name: bot.user.username,
          icon_url: bot.user.avatarURL
        },
        color: 0x00FFFF,
        title: "SoSI-HUI: Sounin Stability Indicator - Helping User Interface",
        url: 'https://github.com/desperial/sounin-stability-indicator',
        footer:{
          text: "Можете звездануть бота на GitHub",
          icon_url: bot.user.avatarURL
        }
      };
      var embed = new Discord.RichEmbed(embedData)

      embed.setThumbnail("https://image.ibb.co/c7LU7p/14483994260450.png")
      var helpText ='';

      if(params.length>0){
        params.forEach((val, ind, arr)=>{
          var commandHelp = Object.keys(commands).find((val2find)=>{
            return val2find===val
          });

          if(commandHelp){
            commandHelp==='huisya'?embed.setColor(0xFF0000):null;
            var paramsHelp ='';
            if(commands[commandHelp].params){
              Object.keys(commands[commandHelp].params).forEach((valP,indP,arrP) => {
                paramsHelp += commands[commandHelp].params[valP].required===true?`<${valP}> `:`[${valP}] `;
              })
            }
            embed.addField(`${commandHelp} ${paramsHelp}`, commands[commandHelp].description )
            embed.addBlankField(true)


            if(commands[commandHelp].params){
              var paramsHelp ='';

              Object.keys(commands[commandHelp].params).forEach((valP,indP,arrP) => {
                paramsHelp += `**${valP}**: ${commands[val].params[valP].required===true?`(обязательный)`:`(опциональный)`} ${commands[val].params[valP].description}\n`
              })

              embed.addField(`Параметры`, paramsHelp )
              embed.addBlankField(true)
            }

            if(commands[commandHelp].usage){
              embed.addField(`Пример использования:`, commands[commandHelp].usage )
            }
            
          }
        })

        msg.author.send(embed);
        return msg.reply('информация о командах отправлена Вам личным сообщением.')
      }else{
        embed.setDescription(`Ниже приведен ~~почти~~ полный список команд бота.\n Чтобы подробнее почитать об использовании команды, введите ${config.prefix}help [cmd]\nНапример, ${config.prefix}help prefix расскажет Вам, как менять префикс бота.`)
        var commandsList = '';
        var descriptionList = '';
        Object.keys(commands).forEach((val,ind,array) => {
          if(commands[val].hidden === undefined){
            var paramsHelp = '';
            if(commands[val].params){
              Object.keys(commands[val].params).forEach((valP,indP,arrP) => {
                paramsHelp += commands[val].params[valP].required===true?`<${valP}> `:`[${valP}] `;
              })
            }
            commandsList += `\`${config.prefix}${val} ${paramsHelp} - ${commands[val].descriptionShort}\`\n\n`
            descriptionList += `\n`
          }
        });
        embed.addField(`Командs`, commandsList, true)
        msg.author.send(embed);
        return msg.reply('полный список команд отправлен Вам в личные сообщения.')
      }
    }
  },

  "answer":{
    hidden: true,
    process: (bot, msg, souninId, params)=>{
      const channel = bot.channels.get(config.channelId);
      const id = params[0];
      params.splice(0,1,id==='none'?null:`<@${id}>`)
      const answer = params.join(' ')
      channel.send(answer);
    }
  },

  "set-sounin-roles":{
    descriptionShort: "Выдать роли Соунину",   
    description: "Выдает Соунину роли, которые у него были.",
    process: (bot, msg, souninId, params)=>{
       const sounin = msg.guild.members.get(souninId);
       config.souninRoles.forEach((val,ind,arr)=>{
        sounin.addRole(val)
       })
      msg.channel.send(lineRandom(lines.souninRolesSet));
    }
  },

  "prefix":{
    descriptionShort: "смена префикса",   
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
  
  // "tts-rukki":{
  //   process: async (bot, msg, souninId, params)=>{
  //     if(msg.author.id!==`170447260939714560`){
  //       msg.reply(`Вам нельзя использовать данную команду!`)
  //     }else{
  //       var channel = msg.member.voiceChannel
  //       if(!channel){
  //         return msg.reply('Вы не находитесь в голосовом канале.')
  //       }
  //       const connection = await channel.join();
  //       var url = IBMSpeechRequest();
  //       console.log(url)

  //       var streamOptions = {
  //         volume:2,
  //         passes:5,
  //         bitrate:64
  //       }
  //       var dispatcher = connection.playArbitraryInput(url, streamOptions)
  //       dispatcher.on('speaking', (value)=>{
  //       })
  
  //       dispatcher.on('end', (reason)=>{
  //         channel.leave()
  //       })
  //     }
  //   }
  // },

  "check-last-leave":{
    description:`Выводит последний таймстамп лива Соунина по часовому поясу +5 GMT и количество дней, которые он продержался. Почему, скажем, не по МСК?
     \"*Это потому что в жоже не было станда про часовые пояса или про Гринвич*\" (С) Pickleman.`,
    process: function(bot,msg,souninId, params=[]){

      const sounin = msg.guild.members.get(souninId);
      if (sounin) {
        var souninLeft = lastLeave.end;
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

  // "statistic":{
  //   descriptionShort: "статистика по ливам Соунина",

  //   description: "Статистика по ливам Соунина",
  //   process: function(bot,msg,souninId, params){
  //     var statisticModel = Model('Statistic');
     
  //     statisticModel.findOne({}, (err,doc) => {
  //       const sounin = msg.guild.members.get(souninId);
  //       if (sounin) {
  //         var souninLeft = sounin.joinedTimestamp;
  //         var daysSinceSouninLeft = Math.floor((Date.now() - souninLeft) / (1000 * 60 * 60 * 24));
  
  //       }
  //       msg.reply(`за время моей официальной работы было зафиксировано ${doc.leavesCount} ливов\r\n\
  //           Рекордный срок нахождения Соунина на сервере из зафиксированных:\r\n\
  //             ${Math.floor(doc.maxStabilityDurationWeeks)} недель \r\n\
  //             ... это ${Math.floor(doc.maxStabilityDurationDays)} дней \r\n\
  //             ... это ${Math.floor(doc.maxStabilityDurationHours)} часов \r\n\
  //           Поскольку Соунин ещё не ливнул, его нынешний результат в ${daysSinceSouninLeft} дней ${(daysSinceSouninLeft>doc.maxStabilityDurationDays)?'(идет на рекорд, кстати!)':''} в учет не взят
  //       `);
  //     });
      
  //   }
  // },

  "kisya":{
    descriptionShort: "случайная кися",

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
    descriptionShort: "случайная совушка",

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

  "picrandom":{
    descriptionShort: "случайная пикча из GIPHY",

    description: `Хочешь чего-то ещё (например, пиздюлей) а отдельной команды нет?\n Вот она!`,
    params:{
      "tag":{
        description:"Теги через пробел, по которым будет выдаваться случайная картинка.",
        required:true
      },
    },
    usage:`${config.prefix}picrandom owl выведет картинку по тегу "сова". Никакой гарантии, что это действительно будет сова. Всё зависит от тегов непосредственно в GIPHY`,
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
    descriptionShort: "выразить недовольство этим казино в войсах",
    description:"Тест яндекс.спичкита. Бот заходит в войс-канал, декларирует его, как казино, упоминает об оральном сношении с ним и скоропостижно покидает заведение.",
    process: async (bot,msg,souninId, params)=>{
      var channel = msg.member.voiceChannel
      const connection = await channel.join();
      var url = ySpeechRequest('Ёбаный рот этого казино, блять! Ты кто такой, сука? Чтоб это сделать? Вы чё, дебилы? Вы чё, ебанутые что ли, блять? Вот действительно, вы внатуре ебанутые? Этот сидит, чешет колоду, этот sтоит говорит, "я тебе сейчас тоже раздам", блять!', 'evil');
      var streamOptions = {
        volume:2,
        passes:5,
        bitrate:64
      }
      var dispatcher = connection.playArbitraryInput(url, streamOptions)
      dispatcher.on('speaking', (value)=>{
        console.log(value);
      })

      dispatcher.on('end', (reason)=>{
        channel.leave();
      })
      
    }
  },

  // "tts":{
  //   descriptionShort: "Сказануть фразу в войс-чате",
  //   description:"Бот заходит в войс-канал, в котором Вы находитесь во время исполнения команды, говорит реквестированную фразу и покидает канал.",
  //   params:{
  //     "text":{
  //       description:"Текст, который скажет бот прямо в войс-чат.",
  //       required:true
  //     },
  //     "-g|-n|-e":{
  //       description:"флаг эмоционального окраса чтения TTS. **g**ood, **n**eutral, **e**vil. По-умолчанию -n",
  //       required:false
  //     }
  //   },
  //   process: (bot,msg,souninId, params)=>{
      
  //     if(params.length>0){
  //       const emotionFlag = params.find((val,ind,arr) => { 
  //         if(val === '-g' || val === '-e' || val === '-n'){
  //           params.splice(ind, 1);
  //           return val;
  //         }
  //       })

  //       var emotion = 'neutral'
  //       if(emotionFlag){
  //         switch (emotionFlag){

  //           case '-g': 
  //             emotion = 'good';
  //             break
            
  //           case '-n': 
  //             emotion = 'neutral';
  //             break

  //           case '-e': 
  //             emotion = 'evil';
  //             break

  //         }
  //       }
  //       var textToSpeech
  //       params.length>0
  //         ?textToSpeech = params.join(' ')
  //         :msg.reply('Текста не осталось. Вы что же, ввели только флаг?');

  //       var channel = msg.member.voiceChannel
  //       if(!channel){
  //         return msg.reply('Вы не находитесь в голосовом канале.')
  //       }
  //       var url = ySpeechRequest(textToSpeech,emotion);
  //         console.log(url)
          
  //         download(url, __dirname, function(err){
  //           if(err){
  //             console.error(err);
  //           }else{
  //             console.log("Download complete");
  //           }
  //        });
  //       channel.join().then(connection=>{
          
  //         console.log("debug1")
  //         var streamOptions = {
  //           volume:1,
  //           passes: 10,
  //           bitrate: 64000,
  //         }
  //         console.log("debug2")
  //         const dispatcher = connection.playStream(fs.createReadStream(__dirname+'/file.wav'),streamOptions);
  //         dispatcher.on('speaking', (value)=>{
  //           console.log("debug4")
  //         })
    
  //         dispatcher.on('end', (reason)=>{
  //           console.log(reason)
  //           channel.leave()
  //         })
  //       });
        

  //     }else{
  //       msg.reply('Текста совершенно нет!');
  //     }
  //   }
  // },

  "test":{
    descriptionShort: "Пройди тест \"Кто ты из таверны <<Розовый Дилдоэзреаль?>>.\"",

    description: `Пройди тест "Кто ты из таверны <<Розовый Дилдоэзреаль?>>.`,
    process: async (bot,msg,souninId, params)=>{
      msg.reply("Обрабатываем результат...");
      var identifyer = msg.author.id
      msg.reply(lines[identifyer]);
    }
  },

  "huisya":{
    description: `Данная команда внесена в реестр запрещенных команд SoSI-HUI.`,
    usage: `Ты ныряешь в запретную магию, парень! Остановись, пока остановка не стала последней!`,
    hidden: true,
    process: async (bot,msg,souninId, params)=> {
      msg.reply('HUISYA AWAKEN', {files:['https://dl.backbook.me/full/0efb3dead1.jpg']})
    }
  },

  "request":{
    description: "Создайте реквест желаемого функционала в трелло!",
    descriptionShort: "Создать реквест в трелло",
    params:{
      "title":{
        description: "заголовок задачи",
        required: true
      },
      "description":{
        description: "Описание задачи",
        required: false
      }
    },
    usage:`Это, пожалуй, первая команда, где аргументы надо прописывать в кавычках.\n${config.prefix}request "хочу шорткат функции Х" "добавь шорткат для функции Х, чтобы вместо ХХХ я вводил Х и экономил время и жизнь" - таким образом вы создадите новую карточку в Trello, которую я посмотрю С:`,
    process: async (bot,msg,souninId, params)=> {

      var fullParams;

      params.length>0
          ?fullParams = params.join(' ')
          :msg.reply('Вы ничего не ввели.');

      if(fullParams){
        console.log(fullParams)

        var paramsArray = fullParams.split('"')
        console.log(paramsArray)

        var title = paramsArray[1];
        var description = `Отправлено: ${msg.author.username}\n`;
        if (paramsArray[3] === undefined){
         description += "Описание не оставлено, так что ориентируйся по сабжу."
         
        }else{
          description += paramsArray[3]
        }
        var newCard =
          {
            name: title,
            desc: description,
            pos: "top",
            due: null,
            idList: config.trelloRequestList
          };

          trelloController.post('/1/cards', newCard, function (err, data) {
            if(err){
              return msg.reply(`Произошла ошибка!`)
            }
            msg.reply(`Карточка ${data.name} была добавлена. Вы можете посмотреть её по адресу ${data.url}`)
            console.log(data);
          });
      }else{
        return false;
      }

      
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

function ySpeechRequest(text, emotion){
  // text += text.substring(0,(text.length/2))
  return encodeURI(`http://tts.voicetech.yandex.net/generate?key=${config.yaSpeechKit}&text=${text}&format=opus&quality=hi&lang=ru-RU&speaker=ermil&speed=1&emotion=${emotion}`)
}
function download(url, dest, callback) {
  var file = fs.createWriteStream(dest+'/file.wav');
  var request = http.get(url, function (response) {
    response.pipe(file);
  file.on('finish', function () {
  file.close(callback); // close() is async, call callback after close completes.
});
    file.on('error', function (err) {
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      if (callback)
        callback(err.message);
    });
  });
}

module.exports = commands
