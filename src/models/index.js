const mongoose = require("mongoose");
const config = require('../config.json');
database = config.db;
dbUri = database.protocol+database.server+':'+database.port+'/'+database.schema;

mongoose.connect(dbUri);

module.exports = function(includeFile){
    return require('./'+includeFile);
};
