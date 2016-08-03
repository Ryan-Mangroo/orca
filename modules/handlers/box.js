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

		var account = req.session.userprofile.acct._id;

		var newBox = new Box();
		newBox.title = title;
		newBox._acct = account;

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

exports.getBox = function(req, res) {

};