const Model = require('../models');

/**
*
*
*/
class Statistic {

  constructor(data){
    if(data){
      this.leavesCount = data.leavesCount;
    }
  }

  /**
  * Сохраняет модель статистики Соунина
  */
  save(){
    var stats = new Model('Statistic')({leavesCount:this.leavesCount});
    stats.save(function (err) {
        if (err) return console.log(err);
        // saved!
      })
  }

  /**
  * Обновляет статистику Соунина
  */
  updateLeaves(){
    var statisticModel = Model('Statistic');
    var leavingModel = Model('Leaving');
    leavingModel.count({}, (err,count) => {
      if (err) return  handleError(err);
      leavingModel.find({}, (err,docs) => {
        var durationsArray = [];
        docs.forEach((doc, index, arr) => {
          durationsArray.push(doc['end'] - doc['start'])
        });
        console.log(statisticModel.updateOne({char_id:"sounin"},{
          leavesCount:count, 
          maxStabilityDuration:Math.max(...durationsArray),
          maxStabilityDurationWeeks:Math.max(...durationsArray)/(1000 * 60 * 60 * 24 * 7),
          maxStabilityDurationDays:Math.max(...durationsArray)/(1000 * 60 * 60 * 24),
          maxStabilityDurationHours:Math.max(...durationsArray)/(1000 * 60 * 60),
        },{rawResponse:true}, (err, raw) => {
          if (err) return handleError(err);
          console.log('The raw response from Mongo was ', raw);
        }));
        
        
      });
    });
  }
  sendStatistic(message){
    var statisticModel = Model('Statistic');
    statisticModel.findOne({char_id:'sounin'}, (err,doc) => {
      console.log(doc)
    });
  }

}
module.exports = Statistic;
