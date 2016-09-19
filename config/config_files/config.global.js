var config = module.exports = {};

config.env = 'development';
config.hostname = 'orca.workwoo.com';

//Platform app
config.platform = {};
config.platform.url = 'http://orca.workwoo.com/';
config.platform.port = 1337;

//mongo database
config.mongo = {};
config.mongo.uri = process.env.MONGODB_URI;
config.mongo.poolSize = 10;
config.mongo.keepAlive = 120; //milliseconds

//Mongoose
config.mongoose = {};
config.mongoose.options = { versionKey: '_version', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } };

//mailer
config.mailer = {};
config.mailer.user = 'support@workwoo.com';
config.mailer.pass = 'cmncvjbyqefmsdtn';
config.mailer.from = 'WorkWoo <support@workwoo.com>';
config.mailer.replyTo = 'WorkWoo <support@workwoo.com>';
config.mailer.tokenPlaceholder = '|TOKEN|';
config.mailer.hostNamePlaceholder = '|HOSTNAME|';
config.mailer.forgotPasswordTemplate = 'Forgot Password';
config.mailer.resetPasswordTemplate = 'Reset Password';
config.mailer.signupTemplate = 'Signup';

// Cache
config.cache = {};
config.cache.checkPeriod = 300; // 5 Minutes
config.cache.longTTL = 7200; // 2 hours
config.cache.mediumTTL = 3600; // 1 hour
config.cache.shortTTL = 1800; // 30 Minutes

//session
config.session = {};
config.session.name = 'orca-session';
config.session.secret = 'supercat keiko';

config.session.cookie = {};
config.session.cookie.path = '/';
config.session.cookie.httpOnly = false;
config.session.cookie.secure = false;
config.session.cookie.maxAge = null;
config.session.cookie.domain = '.workwoo.com';

config.session.store = {};
config.session.store.url = process.env.MONGO_SESSION_URI || 'mongodb://heroku_2bffp60h:mn0tfokfo5bknhh691dom3om69@ds139655.mlab.com:39655/heroku_2bffp60h';
config.session.store.ttl = 30 * 60; // 30 minutes
config.session.store.touchAfter = 15 * 60; // 15 minutes
config.session.store.autoRemove = 'native';


