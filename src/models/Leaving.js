const mongoose = require("mongoose");

schema = new mongoose.Schema({
  start: 'Date',
  end: 'Date'
});

module.exports = mongoose.model('leavings', schema);
