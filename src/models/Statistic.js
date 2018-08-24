const mongoose = require("mongoose");

schema = new mongoose.Schema({
  char_id: 'String',
  leavesCount: 'Number',
  maxStabilityDuration: 'Number',
  maxStabilityDurationWeeks: 'Number',
  maxStabilityDurationDays: 'Number',
  maxStabilityDurationHours: 'Number',
});

module.exports = mongoose.model('statistic', schema);
