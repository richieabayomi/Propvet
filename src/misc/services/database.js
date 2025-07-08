const mongoose = require("mongoose");
module.exports.Schema = mongoose.Schema;
module.exports.Model = mongoose.model;
module.exports.Database = mongoose;
module.exports.Connection = mongoose.connection;
module.exports.mongoose = mongoose;
