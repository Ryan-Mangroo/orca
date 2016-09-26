var env = process.env.NODE_ENV;
var cfg = require('./config_files/config.' + env);
module.exports = cfg;