var cfg = require('../../config/config');
var Message = require('../models/message');
var Inbox = require('../models/inbox');
var NotificationTemplate = require('../models/notificationtemplate');
var mailer = require('../../utils/mailer');
var Counter = require('../models/counter');
var validator = require('../../utils/validator');
var utility = require('../../utils/utility');
var log = require('../../utils/logger');

var natural = require('natural');
var TermFrequency = natural.TfIdf;
var StopwordFilter = require('node-stopwords-filter');

var widget = 'message';
log.registerWidget(widget);

exports.create = function(req, res) {
	try {
		var inboxID = req.body.inbox;
		var accountID = req.body.account;
		var mood = req.body.mood;
		var content = req.body.content;

		var error = null;
		if (validator.checkNull(inboxID)) {
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
		newMessage._inbox = inboxID;
		newMessage._account = accountID;
		newMessage.mood = mood;
		newMessage.content = content;
		newMessage.save(function(error, message) {
    		if (error) {
				log.error('|message.create.save| Unknown  -> ' + error, widget);
				utility.errorResponseJSON(res, 'Error while creating message');
			} else {
				// Send notification to the watchers of this inbox
				notifyWatchers(inboxID, message);

		    	// The, re-summarize the keywords for the inbox
		    	resummarizeKeywords(accountID, inboxID);

		    	// Finally, just return... we dont need to wait for completion of the notifications or rebuilding
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
		var messageID = req.query.messageID;
		var accountID = req.session.userprofile.account._id;

		var error = null;
		if (validator.checkNull(messageID)) {
			error = 'Message ID is null';
		}

		if (error) {
			log.error('|message.getOne| ' + error, widget);
			return utility.errorResponseJSON(res, 'Error occurred getting message');
		}

		Message.findOne({ _id: messageID, _account: accountID })
			.populate('comments._created_by', '-password')
			.exec(
			function (error, message) {
				if (error) {
					log.error('|message.getOne.findOne| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error occurred getting message');
				} else if(!message) {
					log.info('|message.getOne| Message not found -> ' + messageID);
					return res.send(JSON.stringify({error: 'Message Not Found'}));
				} else {		
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
	    var inboxID = req.query.inboxID;
	    var sortField = req.query.sortField;
	    var sortOrder = req.query.sortOrder;
	    var anchorFieldValue = req.query.anchorFieldValue;
	    var anchorID = req.query.anchorID;
	    var searchTerm = req.query.searchTerm;
	    var additionalQuery = req.query.queryCriteria;
		var messagesPerPage = 5000;
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
					// Now that we have the inboxID, search for the messages
					var options = {
						accountID: accountID,
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
		var messageIDs = req.body.messages;
		var accountID = req.session.userprofile.account._id;
		log.info('|message.delete| Deleting messages: ' + messageIDs, widget);

    	Message.remove({ _id: { $in: messageIDs }, _account: accountID }, function(error) {
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
		var accountID = req.session.userprofile.account._id;

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

		Message.findOne({ _id: messageID, _account: accountID })
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
			}
		);
	} catch (error) {
		log.error('|message.addComment| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Error occurred getting message');
	}
};


/*
 * Notify the watchers of an inbox that new feedback has been received.
 */
function notifyWatchers(inboxID, message) {
	Inbox.findOne({ _id: inboxID }).populate('_watchers', 'email').exec(
		function(error, inbox) {
			if (error) {
				log.error('|message.notifyWatchers| Unknown  -> ' + error, widget);
			} else {
				NotificationTemplate.findOne({ name: 'New Feedback'}, function (error, notificationTemplate) {
					if (error) {
						log.error('|message.notifyWatchers| Unknown -> ' + error, widget);
					} else if(!notificationTemplate) {
						log.error('|message.notifyWatchers| Email template not found', widget);
					} else {

						// Give the feedback content and the link to that feedback
						var newFeedbackURL = 'http://orca.workwoo.com/#/message/' + message._id;
						notificationTemplate.html = notificationTemplate.html.replace('|NEW_FEEDBACK_MESSAGE|', message.content);
						notificationTemplate.html = notificationTemplate.html.replace('|NEW_FEEDBACK_URL|', newFeedbackURL);

						// Send 1 email to each watcher
						for( var i=0; i<inbox._watchers.length; i++) {
							mailer.sendMail(notificationTemplate, { to: inbox._watchers[i].email, bcc: '' }, inbox._watchers[i]._id);
						}
						// BCC us on each feedback (for now)
						//mailer.sendMail(notificationTemplate, { to: 'jesse@workwoo.com', bcc: '' }, '57f9f1d0dce00a9940f276d2');
					}
				});
			}
		}
	);
}



/*
 * Rebuilds and re-classifies the top 20 keywords list when a new message is received
 */ 
function resummarizeKeywords(accountID, inboxID) {
	log.info('|message.resummarizeKeywords| Rebuilding keywords', widget);

	// Get all messages from the inbox
	var options = {
		accountID: accountID,
		inboxID: inboxID,
		sortField: 'created_at',
		sortOrder: 'desc',
		anchorFieldValue: null,
		anchorID: null,
		searchTerm: null,
		messagesPerPage: 10000,
		additionalQuery: null
	};

	Message.search(options, function(error, result){
		if (error) {
			log.info('|message.search| Unknown -> ' + error, widget);
		} else {
			var filter = new StopwordFilter();

			// Add each message's stop-word-filtered text to a single string
			var fullResults = '';
			for(var i=0; i<result.messages.length; i++) {
				var filteredContent = filter.filter(result.messages[i].content, 'string');
				fullResults += filteredContent + ' ';
			}

			var limit = 50;
		    var count = 0;
		    var topKeywords = [];

		    // Determine the term frequency and add the top 20 results to an array
		    var frequencyCounter = new TermFrequency();
			frequencyCounter.addDocument(fullResults);
			frequencyCounter.listTerms(0).forEach(function(result) {
				if(count < limit) {
					topKeywords.push(result.term);
					count++
				}
			});

			// Save the results to the inbox
			Inbox.findOne({ _id: inboxID, _account: accountID })
				.exec(
				function (error, inbox) {
					if (error) {
						log.error('|Message.resummarizeKeywords.Inbox.findOne| Unknown  -> ' + error, widget);
						utility.errorResponseJSON(res, 'Error getting inbox');
					} else if(!inbox) {
						log.info('|Message.resummarizeKeywords.Inbox.findOne| Inbox not found -> ' + inboxID, widget);	
						utility.errorResponseJSON(res, 'Invalid inbox');
					} else {
						
						inbox.topKeywords = topKeywords;
						inbox.save(function(error, updatedInbox){
							if(error) {
								log.error('|Message.resummarizeKeywords.Inbox.save| Error saving top keywords for inbox -> ' + inboxID, widget);	
							} else {
								log.info('|Message.resummarizeKeywords.Inbox.save| Top keywords saved for inbox -> ' + inboxID, widget);	
							}
						});
					}
				}
			);
		}
	});
}



