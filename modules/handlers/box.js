// Config
var cfg = require('../../config/config');

// Mongoose
var Box = require('../models/box');

// Custom modules
var Counter = require('../models/counter');
var validator = require('../../utils/validator');
var utility = require('../../utils/utility');
var log = require('../../utils/logger');
var widget = 'box';
log.registerWidget(widget);

exports.create = function(req, res) {
	try {
		var title = req.body.title;

		var error = null;
		if (validator.checkNull(title)) { error = 'Title is Null'; } 

		if (error) {
			log.error('|box.create| ' + error, widget);
			return utility.errorResponseJSON(res, 'Error while creating box');
		}

		var account = req.session.userprofile.account._id;

		var newBox = new Box();
		newBox.title = title;
		newBox._account = account;

		newBox.save(function(error, box) {
    		if (error) {
				log.error('|box.create.save| Unknown  -> ' + error, widget);
				utility.errorResponseJSON(res, 'Error while creating box');
			} else {
				log.info('|box.create.save| New box created -> ' + box._id, widget);				
				res.send(JSON.stringify({ box: box }));
			}
    	});

	} catch (error) {
		log.error('|box.create| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error while creating box');
	}
};

exports.getInfo = function(req, res) {
	try {
		log.info('|box.getInfo|', widget);

		var boxNumber = req.query.boxNumber;
		var token = req.query.token;
		var error = null;

		// TODO: Scrub token

		if (validator.checkNull(boxNumber)) {
			error = 'Box number is null';
		} else if (!validator.checkAlphanumeric(boxNumber)) {
			error = 'Box number is invalid';
		}

		if (error) {
			log.error('|box.getInfo| ' + error, widget);
			return utility.errorResponseJSON(res, 'Error occurred getting box info');
		}

		log.info('|box.getInfo| Getting box info -> ' + boxNumber + ', token -> ' + token, widget);

		Box.findOne({ number: boxNumber, token: token }, '-_account')
			.exec(
			function (error, boxInfo) {
				if (error) {
					log.error('|box.getInfo.findOne| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error occurred getting box');
				} else if(!boxInfo) {
					log.info('|box.getInfo| Box credentials invalid -> ' + boxNumber + ', token -> ' + token);	
					utility.errorResponseJSON(res, 'Invalid box credentials');
				} else {		
					log.info('|box.getInfo| Box found -> ' + boxInfo._id);	
					res.send(JSON.stringify({ result: boxInfo }));
				}
			});
	} catch (error) {
		log.error('|box.getInfo| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Error occurred getting box');
	}
};