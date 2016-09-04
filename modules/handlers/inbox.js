var cfg = require('../../config/config');
var Inbox = require('../models/inbox');
var crypto = require('crypto');
var Counter = require('../models/counter');
var validator = require('../../utils/validator');
var utility = require('../../utils/utility');
var log = require('../../utils/logger');
var widget = 'inbox';
log.registerWidget(widget);

exports.resetToken = function(req, res) {
	try {
		log.info('|inbox.resetToken|', widget);
		var inboxID = req.body.inboxID;
		var error = null;
		if (validator.checkNull(inboxID)) { error = 'Inbox ID is Null'; } 

		if (error) {
			log.error('|inbox.resetToken| ' + error, widget);
			return utility.errorResponseJSON(res, 'Error trying to reset inbox token');
		}

		var accountID = req.session.userprofile.account._id; // Put some king of account separation globally ------------------------------- TODO
		
		log.info('Account ID: ' + accountID, widget);

		Inbox.findOne({ _account: accountID, _id: inboxID })
			.exec(
			function (error, inbox) {
				if (error) {
					log.error('|inbox.resetToken.findOne| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error occurred getting inbox');
				} else if(!inbox) {
					log.info('|inbox.resetToken| Inbox not found -> ' + inboxID, widget);	
					utility.errorResponseJSON(res, 'Inbox not found');
				} else {		
					log.info('|inbox.resetToken| Inbox found -> ' + inbox._id, widget);	

					inbox.token = crypto.randomBytes(12).toString('hex');
					inbox.save(function(error){
						if(error) {
							log.error('|inbox.resetToken.save| Unknown  -> ' + error, widget);
							utility.errorResponseJSON(res, 'Error occurred saving new inbox token');
						} else {
							log.info('|inbox.resetToken| Inbox token reset successfully -> ' + inbox._id, widget);	
							req.session.userprofile.account._primary_inbox = inbox;
							res.send(JSON.stringify({ result: inbox }));
						}
					});
				}
			}
		);
	} catch (error) {
		log.error('|inbox.resetToken| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error trying to reset inbox token');
	}
};


exports.getInfo = function(req, res) {
	try {
		log.info('|inbox.getInfo|', widget);

		var inboxNumber = req.query.inboxNumber;
		var token = req.query.token;
		var error = null;

		// TODO: Scrub token

		if (validator.checkNull(inboxNumber)) {
			error = 'Box number is null';
		} else if (!validator.checkAlphanumeric(inboxNumber)) {
			error = 'Box number is invalid';
		}

		if (error) {
			log.error('|inbox.getInfo| ' + error, widget);
			return utility.errorResponseJSON(res, 'Error occurred getting inbox info');
		}

		log.info('|inbox.getInfo| Getting inbox info -> ' + inboxNumber + ', token -> ' + token, widget);

		Inbox.findOne({ number: inboxNumber, token: token }, '-_account')
			.exec(
			function (error, inboxInfo) {
				if (error) {
					log.error('|inbox.getInfo.findOne| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error occurred getting inbox');
				} else if(!inboxInfo) {
					log.info('|inbox.getInfo| Inbox credentials invalid -> ' + inboxNumber + ', token -> ' + token);	
					utility.errorResponseJSON(res, 'Invalid inbox credentials');
				} else {		
					log.info('|inbox.getInfo| Inbox found -> ' + inboxInfo._id);	
					res.send(JSON.stringify({ result: inboxInfo }));
				}
			}
		);
	} catch (error) {
		log.error('|inbox.getInfo| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Error occurred getting inbox');
	}
};

/*
exports.create = function(req, res) {
	try {
		log.info('|inbox.create|', widget);
		var title = req.body.title;
		var error = null;
		if (validator.checkNull(title)) { error = 'Title is Null'; } 

		if (error) {
			log.error('|inbox.create| ' + error, widget);
			return utility.errorResponseJSON(res, 'Error while creating inbox');
		}

		var account = req.session.userprofile.account._id;

		var newInbox = new Inbox();
		newInbox.title = title;
		newInbox._account = account;

		newInbox.save(function(error, inbox) {
    		if (error) {
				log.error('|inbox.create.save| Unknown  -> ' + error, widget);
				utility.errorResponseJSON(res, 'Error while creating inbox');
			} else {
				log.info('|inbox.create.save| New inbox created -> ' + inbox._id, widget);				
				res.send(JSON.stringify({ inbox: inbox }));
			}
    	});

	} catch (error) {
		log.error('|inbox.create| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error while creating inbox');
	}
};
*/
