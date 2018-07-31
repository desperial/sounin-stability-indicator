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
        })
        Math.max(...durationsArray)

      })
      statisticModel.updateOne({char_id:"sounin"},{leavesCount:count},{rawResponse:true}, (err, raw) => {
        if (err) return handleError(err);
        console.log('The raw response from Mongo was ', raw);
      });
    });
  }

}
module.exports = Statistic;
