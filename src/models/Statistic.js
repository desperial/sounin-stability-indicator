const mongoose = require("mongoose");

schema = new mongoose.Schema({
  char_id: 'String',
  leavesCount: 'Number',
  maxUnleavingDuration: 'Number',
});

module.exports = mongoose.model('statistic', schema);
