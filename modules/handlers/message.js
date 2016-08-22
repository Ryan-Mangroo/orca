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


exports.getOne = function(req, res) {
	try {
		log.info('|message.getOne|', widget);
		var messageID = req.query.messageID;

		var error = null;
		if (validator.checkNull(messageID)) {
			error = 'Message ID is null';
		}

		if (error) {
			log.error('|message.getOne| ' + error, widget);
			return utility.errorResponseJSON(res, 'Error occurred getting message');
		}
		log.info('|message.getOne| Getting message -> ' + messageID);
		Message.findById(messageID)
			.populate('comments._created_by', '-password')
			.exec(
			function (error, message) {
				if (error) {
					log.error('|message.getOne.findById| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error occurred getting message');
				} else if(!message) {
					log.info('|message.getOne| Message ID not found -> ' + messageID);	
					utility.errorResponseJSON(res, 'Message ID not found');
				} else {		
					log.info('|message.getOne| Message found -> ' + message._id);	

					message.comments.reverse();
					res.send(JSON.stringify({ result: message }));
				}
			});
	} catch (error) {
		log.error('|message.getOne| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Error occurred getting message');
	}
};


exports.getAll = function(req, res) {
	try {
		log.info('|message.getAll|', widget);

		// TODO: Scrub request body... Need to get messages by the box account
		var accountID = req.session.userprofile.account._id;	
		
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

exports.addComment = function(req, res) {
	try {
		log.info('|message.addComment|', widget);
		var messageID = req.body.messageID;
		var commentText = req.body.commentText;

		var error = null;
		if (validator.checkNull(messageID)) {
			error = 'Message ID is null';
		}

		if (validator.checkNull(commentText)) {
			error += 'Comment is null';
		}

		if (error) {
			log.error('|message.addComment| ' + error, widget);
			return utility.errorResponseJSON(res, 'Error occurred getting message');
		}

		log.info('|message.addComment| Commenting message -> ' + messageID);

		Message.findById(messageID)
			.exec(
			function (error, message) {
				if (error) {
					log.error('|message.addComment.findById| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error occurred getting message');
				} else if(!message) {
					log.info('|message.addComment| Message ID not found -> ' + messageID);	
					utility.errorResponseJSON(res, 'Message ID not found');
				} else {		
					log.info('|message.addComment| Message found -> ' + message._id);

					var newComment = {
						comment: commentText,
						_created_by: req.session.userprofile.id
					};

					message.comments.push(newComment);
					message.save(function(error, updatedMessage){
						if(error) {
							log.info('|message.addComment| Error saving new comment -> ' + messageID);	
							utility.errorResponseJSON(res, 'Error saving comment');
						} else {
							message.populate('comments._created_by', '-password', function(error){
								log.info('Comment success', widget);
								updatedMessage.comments.reverse();
								res.send(JSON.stringify({ result: updatedMessage }));
							});
						}
					});
				}
			});

	} catch (error) {
		log.error('|message.addComment| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Error occurred getting message');
	}
};

