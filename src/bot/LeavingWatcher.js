const Model = require('../models');

/**
*
*
*/
class LeavingWatcher {

  constructor(data){
    if(data){
      this.start = data.start;
      this.end = data.end;
    }
  }

  /**
  * Сохраняет модель лива Соунина
  */
  save(){
    var leaving = Model('Leaving');
    leaving.start = this.start;
    leaving.end = this.end;
    leaving.save(function (err) {
        if (err) return handleError(err);
        // saved!
      })
  }

  /**
  * Считает ливы соунина.
  */
  countLeaves(){
    var leavingModel = Model('Leaving');
    leavingModel.countDocuments({},function(err,count){
      return count;
    });

  }

}
module.exports = LeavingWatcher;
