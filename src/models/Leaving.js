/**
*
*
*/
const mongoose = require("mongoose");
const config = require('../config.json');
const leavingSchema = new mongoose.Schema({
  start: 'Date',
  end: 'Date'
});
database = config.db;
mongoose.connect(database.protocol+database.server+':'+database.port+'/'+database.schema);

class Leaving {

  constructor(data){
    this.start = data.start;
    this.end = data.end;
  }

  save(){
    var LeaveFixator = mongoose.model('Leaving', leavingSchema);
    var leaving = new LeaveFixator({start: this.start, end: this.end});
    leaving.save(function (err) {
        if (err) return handleError(err);
        // saved!
      })
  }

}
module.exports = Leaving;
