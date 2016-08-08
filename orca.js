// Config
var cfg = require('./config/config');

// Web - Session
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');

// Authentication Strategy
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;

// Mongoose
var mongoose = require('mongoose');

// Custom modules
var auth = require('./modules/handlers/auth.js');
var user = require('./modules/handlers/user.js');
var account = require('./modules/handlers/account.js');
var box = require('./modules/handlers/box.js');
var message = require('./modules/handlers/message.js');
var homepage = require('./modules/handlers/homepage.js');

var validator = require('./utils/validator');
var utility = require('./utils/utility');
var log = require('./utils/logger');
var widget = 'orca';
log.registerWidget(widget);

/*
* This function initializes the express app along with mongoose and passport.
* We do not start the app until we've successfully setup mongoDB w/ mongoose.
*/
(function startup() {
	try {
		log.info('| ################## Orca Startup ################## |', widget);

		// 1. Initialize mongoose
		initializeMongoose();

		// 2. Initialize express
		var app = initializeApp();

		// 3. Start app
		app.listen(process.env.PORT || cfg.platform.port);

	} catch (error) {
		log.error('| ################## Orca Startup Error ################## | -> ' + error, widget);
	}
})();

// For now, this function simply checks the user's authentication status.
function validateRequest() {
	return function(req, res, next) {
		log.info('|validateRequest|');
		if (!req.isAuthenticated || !req.isAuthenticated()) {
			log.info('|validateRequest| -> User not authenticated. Sending 401', widget);

			res.status(401);
			var errorMessage = {error: 'Not authenticated'};
			return res.send(JSON.stringify(errorMessage));
		}

		var error = null;
		if (validator.checkNull(req.session.userprofile.id)) { error = 'Session User Id is Null'; } 
		else if (!validator.checkMongoId(req.session.userprofile.id)) { error = 'Session User Id is not valid: ' + userId; } 
		else if (validator.checkNull(req.session.userprofile.account._id)) { error = 'Session account Id is Null'; }
		else if (!validator.checkMongoId(req.session.userprofile.account._id)) { error = 'Session account Id is not valid: ' + accountID; } 

		if (error) {
			log.error('|validateRequest| ' + error, widget);
			res.status(401);
			var errorMessage = {error: error};
			return res.send(JSON.stringify(errorMessage));
		}

		log.info('|validateRequest| -> User authenticated', widget);
		next();
	}
}

function initializeMongoose() {
	try {
		log.info('|initializeMongoose|', widget);
		
		// TODO: Setup more options
		var options = {
			server: { poolSize: cfg.mongo.poolSize, socketOptions: cfg.mongo.keepAlive }
		}

		mongoose.connect(cfg.mongo.uri, options);

		var db = mongoose.connection;
		db.on('error', console.error.bind(console, 'connection error:'));
		db.once('open', function() {
		  log.info('|initializeMongoose| -> Successful connection made to mongoDB', widget);
		});

	} catch (error) {
		log.error('|initializeMongoose| Unknown -> ' + error, widget);
		process.exit(0);
	}
}

function initializeApp() {
	try {
		log.info('|initializeApp|', widget);
		var app = express();
		app.use(bodyParser.urlencoded({ extended: false }));
		app.use(bodyParser.json());
		app.use(express.static('public'));

		// Session setup
		app.use(session({
			name: cfg.session.name,
			secret: cfg.session.secret,
			cookie: cfg.session.cookie,
			resave: false,
			saveUninitialized: false,
			store: new MongoStore({ 
				mongooseConnection: mongoose.connection, /* Reuse our mongoose connection pool */
				ttl: cfg.session.store.ttl,
				autoRemove: cfg.session.store.autoRemove,
				touchAfter: cfg.session.store.touchAfter
			})
		}));

		// Passport setup
		app.use(passport.initialize());
		app.use(passport.session());

		passport.use(new BasicStrategy(auth.verifyCredentials));

		passport.serializeUser(function(user, done) {
			done(null, user.id);
		});

		passport.deserializeUser(function(id, done) {
			done(null, id);
		});

		/* 
		* These headers are for allowing Cross-Origin Resource Sharing (CORS).
		* This enables the angular front-end, which resides in the WorkWoo 
		* Platform app, to make requests to the WorkWoo Auth app.
		*/
/*		app.use(function (req, res, next) {
			res.set({
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				'Access-Control-Allow-Methods': 'POST',
				'Access-Control-Allow-Origin' : req.headers.origin,
				'Access-Control-Allow-Credentials': true
			});
			next();
		});
*/
		
		// Global routes
		app.route('/getUserProfile').get(validateRequest(), user.getUserProfile);

		app.route('/login').get(function(req, res) {
			log.info('|login| Incorrect GET instead of POST', widget);
			req.logout();
			res.sendStatus(401);
		}).post(function(req, res, next) {
			log.info('|login|', widget);
			passport.authenticate('basic', function(error, user, info) {
				if (error) { return next(error); }
				if (!user) { return res.sendStatus(401); }

		    	req.logIn(user, function(error) {
		    		if (error) { return next(error); }
		    		req.session.userprofile = user;
		    		return res.send(JSON.stringify(user));
				});
			})(req, res, next);
		});

		app.get('/logout', function(req, res){
			log.info('|logout|', widget);
			req.session.destroy();
			req.logout();
			res.redirect(cfg.platform.url);
		});

		app.route('/signup').get(function(req, res) {
			log.info('|signup| Incorrect GET instead of POST', widget);
			req.logout();
			res.sendStatus(401);
		}).post(auth.signupRequest);
/*
		app.route('/forgotPwd').get(function(req, res) {
			log.info('|forgotPwd| Incorrect GET instead of POST', widget);
			req.logout();
			res.sendStatus(401);
		}).post(auth.forgotPasswordRequest);

		app.route('/resetPwd').get(function(req, res) {
			log.info('|resetPwd| Incorrect GET instead of POST', widget);
			req.logout();
			res.sendStatus(401);
		}).post(auth.resetPasswordRequest);

		app.route('/verify').get(function(req, res) {
			log.info('|verify| Incorrect GET instead of POST', widget);
			req.logout();
			res.sendStatus(401);
		}).post(auth.verifyRequest);
*/
		// Box & Message
		app.route('/getBoxInfo').get(box.getInfo);
		app.route('/createBox').post(validateRequest(), box.create);
		app.route('/createMessage').post(validateRequest(), message.create);
		app.route('/getAllMessages').get(validateRequest(), message.getAll);
		app.route('/deleteMessages').post(validateRequest(), message.delete);

		// Prediction & Reports
		app.route('/getKeywordSummary').get(validateRequest(), homepage.getKeywordSummary);
		app.route('/updateKeywordSummary').post(validateRequest(), homepage.updateKeywordSummary);

		// Account related
		app.route('/updateAccount').post(validateRequest(), account.update);
		app.route('/updateUser').post(validateRequest(), user.update);
		app.route('/changeUserPassword').post(validateRequest(), user.changePassword);
		
/*
		app.route('/signup').get(function(req, res) {
			log.info('|signup| Incorrect GET instead of POST', widget);
			req.logout();
			res.sendStatus(401);
		}).post(auth.signupRequest);

		app.route('/forgotPwd').get(function(req, res) {
			log.info('|forgotPwd| Incorrect GET instead of POST', widget);
			req.logout();
			res.sendStatus(401);
		}).post(auth.forgotPasswordRequest);

		app.route('/resetPwd').get(function(req, res) {
			log.info('|resetPwd| Incorrect GET instead of POST', widget);
			req.logout();
			res.sendStatus(401);
		}).post(auth.resetPasswordRequest);

		app.route('/verify').get(function(req, res) {
			log.info('|verify| Incorrect GET instead of POST', widget);
			req.logout();
			res.sendStatus(401);
		}).post(auth.verifyRequest);
*/
		return app;
	} catch (e) {
		log.error('|initializeApp| Unknown -> ' + error, widget);
		process.exit(0);
	}
}