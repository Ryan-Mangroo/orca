var config = require('./config.global');

config.env = 'stage';
config.hostname = 'orca-stage.workwoo.com';

//Platform app
config.platform = {};
config.platform.url = 'http://orca-stage.workwoo.com/';

module.exports = config;