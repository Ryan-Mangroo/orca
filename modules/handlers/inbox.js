var cfg = require('../../config/config');
var Inbox = require('../models/inbox');
var crypto = require('crypto');
var aws = require('../../utils/aws-utils')
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
		if (validator.checkNull(inboxID)) {
			error = 'Inbox ID is Null';
		} 

		if (error) {
			log.error('|inbox.resetToken| ' + error, widget);
			return utility.errorResponseJSON(res, 'Error trying to reset inbox token');
		}

		var accountID = req.session.userprofile.account._id; // Put some king of account separation globally ------------------------------- TODO
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


exports.getPublicInfo = function(req, res) {
	try {
		log.info('|inbox.getPublicInfo|', widget);

		var inboxNumber = req.query.inboxNumber;
		var token = req.query.token;
		var error = null;

		if (validator.checkNull(inboxNumber)) {
			error = 'Box number is null';
		} else if (!validator.checkAlphanumeric(inboxNumber)) {
			error = 'Box number is invalid';
		}

		if (error) {
			log.error('|inbox.getPublicInfo| ' + error, widget);
			return utility.errorResponseJSON(res, 'Error occurred getting inbox info');
		}

		log.info('|inbox.getPublicInfo| Getting inbox info -> ' + inboxNumber + ', token -> ' + token, widget);

		Inbox.findOne({ number: inboxNumber, token: token }, '-_account')
			.exec(
			function (error, inboxInfo) {
				if (error) {
					log.error('|inbox.getPublicInfo.findOne| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error occurred getting inbox');
				} else if(!inboxInfo) {
					log.info('|inbox.getPublicInfo| Inbox credentials invalid -> ' + inboxNumber + ', token -> ' + token);	
					utility.errorResponseJSON(res, 'Invalid inbox credentials');
				} else {		
					log.info('|inbox.getPublicInfo| Inbox found -> ' + inboxInfo._id);	
					res.send(JSON.stringify({ result: inboxInfo }));
				}
			}
		);
	} catch (error) {
		log.error('|inbox.getPublicInfo| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Error occurred getting inbox');
	}
};

// Get all inboxes for the current user's account.
exports.getAllInfo = function(req, res) {
	try {
		log.info('|inbox.getAllInfo|', widget);
		var accountID = req.session.userprofile.account._id; // Put some king of account separation globally ------------------------------- TODO
		log.info('|inbox.getAllInfo| Getting inbox info for account -> ' + accountID, widget);

		Inbox.find({ _account: accountID })
			.exec(
			function (error, inboxes) {
				if (error) {
					log.error('|inbox.getAllInfo.findOne| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error occurred getting inboxes');
				} else if(!inboxes) {
					log.info('|inbox.getAllInfo| No inboxes found for account -> ' + accountID, widget);	
					res.send(JSON.stringify({ result: [] }));
				} else {		
					log.info('|inbox.getAllInfo| Inboxes found -> ' + inboxes.length);	
					res.send(JSON.stringify({ result: inboxes }));
				}
			}
		);
	} catch (error) {
		log.error('|inbox.getAllInfo| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Error occurred getting inboxes');
	}
};

// Get the inbox for the ID given
exports.getOneInfo = function(req, res) {
	try {
		log.info('|inbox.getOneInfo|', widget);
		
		var inboxID = req.query.inboxID;
		var accountID = req.session.userprofile.account._id;
		log.info('|inbox.getOneInfo| Loading info for inbox -> ' + inboxID, widget);

		Inbox.findOne({ _account: accountID, _id: inboxID })
			.exec(
			function (error, inbox) {
				if (error) {
					log.error('|inbox.getOneInfo.findOne| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error occurred getting inbox');
				} else if(!inbox) {
					log.info('|inbox.getOneInfo| No inbox found -> ' + inboxID, widget);	
					utility.errorResponseJSON(res, 'Error occurred getting inbox');
				} else {		
					log.info('|inbox.getOneInfo| Inbox found -> ' + inbox._id);	
					res.send(JSON.stringify({ result: inbox }));
				}
			}
		);
	} catch (error) {
		log.error('|inbox.getOneInfo| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Error occurred getting inbox');
	}
};


exports.getSignedImageURL = function(req, res) {
	try {
		log.info('|inbox.getSignedImageURL|', widget);
		var inboxID = req.query.inboxID;

		var fileName = inboxID;
		var fileType = req.query.fileType;
		var bucketName = 'workwoo-inbox-images';

		aws.getSignedS3URL(fileName, fileType, bucketName, function(error, signedRequest){
			if(error || !signedRequest) {
				log.error('|inbox.getSignedImageURL| Error while getting signed request -> ' + error, widget);
				utility.errorResponseJSON(res, 'Error while getting signed request');
			} else {
				// Save the new image URL to the inbox record
				Inbox.findById(inboxID)
		    		.exec(
		    		function(error, inbox) {
			    		if (error) {
							log.error('|inbox.getSignedImageURL.findById| Unknown  -> ' + error, widget);
							utility.errorResponseJSON(res, 'Error occurred updating inbox image');
						} else {
							log.info('Updating image to: ' + signedRequest.url);
							inbox.image = signedRequest.url;
					    	inbox.save(function(error){
								if (error) {
									log.error('|inbox.getSignedImageURL.save| Unknown  -> ' + error, widget);
									utility.errorResponseJSON(res, 'Error occurred updating inbox image');
								} else {
									// Finally send the signed request info
									log.info('|inbox.getSignedImageURL.save| Image save success', widget);
									res.send(JSON.stringify({ result: signedRequest }));
								} 
					    	});
						}
			    	}
			    );
			}
		});
	} catch (error) {
		log.error('|inbox.getSignedImageURL| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error while getting signed request');
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
