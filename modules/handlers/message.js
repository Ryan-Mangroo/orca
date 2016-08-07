// Config
var cfg = require('../../config/config');

// Mongoose
var Message = require('../models/message');

// Custom modules
var Counter = require('../models/counter');
var validator = require('../../utils/validator');
var utility = require('../../utils/utility');
var log = require('../../utils/logger');
var widget = 'message';
log.registerWidget(widget);

exports.create = function(req, res) {
	try {
		var box = req.body._box;
		var mood = req.body.mood;
		var content = req.body.content;

		var error = null;
		if (validator.checkNull(box)) {
			error = 'Box is Null';
		}

		if (validator.checkNull(content)) {
			error = 'Content is Null';
		}

		if (error) {
			log.error('|message.create| ' + error, widget);
			return utility.errorResponseJSON(res, 'Error while creating message');
		}

		var newMessage = new Message();
		newMessage._box = box;
		newMessage.mood = mood;
		newMessage.content = content;
		newMessage.save(function(error, message) {
    		if (error) {
				log.error('|message.create.save| Unknown  -> ' + error, widget);
				utility.errorResponseJSON(res, 'Error while creating message');
			} else {
				log.info('|message.create.save| New message created -> ' + message._id, widget);				
				res.send(JSON.stringify({ result: message }));
			}
    	});

	} catch (error) {
		log.error('|message.create| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error while creating message');
	}
};

exports.getAll = function(req, res) {
	try {
		log.info('|message.getAll|', widget);

		// TODO: Scrub request body
		//var accountID = req.session.userprofile.org._id;
		
		Message.find()
			.exec(
			function (error, messages) {
				if (error) {
					log.error('|message.getAll| Unknown -> ' + error, widget);
					utility.errorResponseJSON(res, 'Unknown error getting messages');
				} else {

					log.info('Messages found: ' + messages.length, widget);

					res.send(JSON.stringify({ result: messages }));
				}
			});
	} catch (error) {
		log.error('|message.getAll| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Unknown error getting messages');
	}
};


exports.delete = function(req, res) {
	try {
		log.info('|message.delete|', widget);

		// TODO: Scrub request body
		var messageIDs = req.body.messages;
		log.info('|message.delete| Deleting messages: ' + messageIDs, widget);

		var query = { _id: { $in: messageIDs } };			
    	Message.remove(query, function(error) {
    		if (error) {
				log.error('|message.delete.remove| Unknown  -> ' + error, widget);
				utility.errorResponseJSON(res, 'Error occurred deleting messages');
			} else {			
				res.send(JSON.stringify({result: true}));
			}
    	});

	} catch (error) {
		log.error('|message.delete| -> ' + error, widget);
		utility.errorResponseJSON(res, 'Error occurred deleting messages');
	}
};

