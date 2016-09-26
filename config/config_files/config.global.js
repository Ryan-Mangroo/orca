var config = module.exports = {};
config.env = process.env.NODE_ENV;
config.hostname = 'orca.workwoo.com';

// Platform
config.platform = {};
config.platform.url = 'http://orca.workwoo.com/';
config.platform.port = 1337;

// MongoDB
config.mongo = {};
config.mongo.uri = process.env.MONGODB_URI;
config.mongo.poolSize = 10;
config.mongo.keepAlive = 120; // milliseconds

// Mongoose
config.mongoose = {};
config.mongoose.options = { versionKey: '_version', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } };

// Mailer
config.mailer = {};
config.mailer.user = process.env.MAILER_USERNAME;
config.mailer.pass = process.env.MAILER_PASS;
config.mailer.from = 'WorkWoo <support@workwoo.com>';
config.mailer.replyTo = 'WorkWoo <support@workwoo.com>';
config.mailer.tokenPlaceholder = '|TOKEN|';
config.mailer.firstNamePlaceholder = '|USER_FIRST_NAME|';
config.mailer.primaryInboxURLPlaceholder = '|PRIMARY_INBOX_URL|';
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

// Session
config.session = {};
config.session.name = 'orca-session';
config.session.secret = process.env.SESSION_SECRET;

config.session.cookie = {};
config.session.cookie.path = '/';
config.session.cookie.httpOnly = false;
config.session.cookie.secure = false;
config.session.cookie.maxAge = null;
config.session.cookie.domain = '.workwoo.com';

config.session.store = {};
config.session.store.url = process.env.MONGO_SESSION_URI;
config.session.store.ttl = 60 * 60; // 30 minutes
config.session.store.touchAfter = 30 * 60; // 15 minutes
config.session.store.autoRemove = 'native';


