var cfg = require('../../config/config');
var Message = require('../models/message');
var Inbox = require('../models/inbox');
var Counter = require('../models/counter');
var validator = require('../../utils/validator');
var utility = require('../../utils/utility');
var log = require('../../utils/logger');
var widget = 'message';
log.registerWidget(widget);

exports.create = function(req, res) {
	try {
		var inbox = req.body._inbox;
		var mood = req.body.mood;
		var content = req.body.content;

		var error = null;
		if (validator.checkNull(inbox)) {
			error = 'Inbox is Null';
		}

		if (validator.checkNull(content)) {
			error = 'Content is Null';
		}

		if (error) {
			log.error('|message.create| ' + error, widget);
			return utility.errorResponseJSON(res, 'Error while creating message');
		}

		var newMessage = new Message();
		newMessage._inbox = inbox;
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

// Scrub request & Account separation ------------------------------------------- TODO
exports.search = function(req, res) {
	try {
		log.info('|message.search|', widget);

	    var inboxID = req.query.inboxID;
	    var sortField = req.query.sortField;
	    var sortOrder = req.query.sortOrder;
	    var anchorFieldValue = req.query.anchorFieldValue;
	    var anchorID = req.query.anchorID;
	    var searchTerm = req.query.searchTerm;
	    var additionalQuery = req.query.queryCriteria;

		var messagesPerPage = 10;

		log.info('|message.search| inboxID -> ' + inboxID, widget);
		log.info('|message.search| sortField -> ' + sortField, widget);
		log.info('|message.search| sortOrder -> ' + sortOrder, widget);
		log.info('|message.search| anchorFieldValue -> ' + anchorFieldValue, widget);
		log.info('|message.search| anchorID -> ' + anchorID, widget);
		log.info('|message.search| searchTerm -> ' + searchTerm, widget);
		log.info('|message.search| additionalQuery -> ' + additionalQuery, widget);

		var accountID = req.session.userprofile.account._id;	

		// First, get the record for the inbox, so we can get its ID.
		Inbox.findOne({ _id: inboxID, _account: accountID })
			.exec(
			function (error, inbox) {
				if (error) {
					log.error('|Message.search.Inbox.findOne| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error getting inbox');
				} else if(!inbox) {
					log.info('|Message.search.Inbox.findOne| Inbox not found -> ' + inboxID, widget);	
					utility.errorResponseJSON(res, 'Invalid inbox');
				} else {		
					log.info('|Message.search.Inbox.findOne| Inbox found -> ' + inbox._id);	
					
					// Now that we have the inboxID, search for the messages
					var options = {
						inboxID: inbox._id,
						sortField: sortField,
						sortOrder: sortOrder,
						anchorFieldValue: anchorFieldValue,
						anchorID: anchorID,
						searchTerm: searchTerm,
						messagesPerPage: messagesPerPage
					};

					if (additionalQuery) {
						options.additionalQuery = JSON.parse(additionalQuery);
					} else {
						options.additionalQuery = null;
					}

					Message.search(options, function(error, result){
						if (error) {
							log.info('|message.search| Unknown -> ' + error, widget);
						} else {
							res.send(JSON.stringify({ result: result }));
						}
					});
				}
			}
		);
	} catch (error) {
		log.error('|message.search| -> Unknown ' + error, widget);
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

