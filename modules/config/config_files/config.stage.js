var config = require('./config.global');

config.env = 'stage';
config.hostname = 'appstage.workwoo.com';

//Platform app
config.platform = {};
config.platform.url = 'http://appstage.workwoo.com/';

module.exports = config;