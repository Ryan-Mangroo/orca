var log = {
	info: function(message) {
		console.log('INFO: ' + message);
	},
	error: function(message) {
		console.log('ERROR: ' + message);
	},
};


// Web
var express = require('express');
var bodyParser = require('body-parser');
var entry = require('./modules/handlers/entry.js');

/*
* This function initializes the express app along with mongoose and passport.
* We do not start the app until we've successfully setup mongoDB w/ mongoose.
*/
(function startup() {
	try {
		log.info('| ########## STARTUP ########## |');

		// 1. Initialize express & start the app
		var app = initializeApp();
		app.listen(process.env.PORT || 8080);

	} catch (error) {
		log.info('| ########## STARTUP ERROR ########## | -> ' + error);
	}
})();


function initializeApp() {
	try {
		log.info('|initializeApp|');

		var app = express();
		app.use(bodyParser.urlencoded({ extended: false }));
		app.use(bodyParser.json());
		app.use(express.static('public'));

		// Routes for item CRUD operations
		app.route('/newEntry').post(entry.new);
		app.route('/getAllEntries').get(entry.getAll);
		app.route('/getOneEntry').get(entry.getOne);


		return app;
	} catch (error) {
		log.error('|initializeApp| Unknown -> ' + error);
		process.exit(0);
	}
}

function getEntries(req, res) {
	res.send('Ok');

}