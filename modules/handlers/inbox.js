var cfg = require('../../config/config');
var Inbox = require('../models/inbox');
var Homepage = require('../models/homepage');
var crypto = require('crypto');
var aws = require('../../utils/aws-utils')
var Counter = require('../models/counter');
var validator = require('../../utils/validator');
var utility = require('../../utils/utility');
var log = require('../../utils/logger');
var widget = 'inbox';
log.registerWidget(widget);

exports.create = function(req, res) {
	try {
		log.info('|inbox.create|', widget);

		var newInbox = new Inbox();
		newInbox.description = req.body.description;
		newInbox.public_title = req.body.public_title;
		newInbox.status = 'active';
		newInbox._account = req.session.userprofile.account._id;
		newInbox._watchers = [req.session.userprofile.id];
		newInbox.image = 'https://workwoo-app-images.s3.amazonaws.com/default-inbox-image.png';

		newInbox.save(function(error, inbox) {
			if (error || !inbox) {
				log.error('|inbox.create.save| Unknown  -> ' + error, widget);
				utility.errorResponseJSON(res, 'Error while creating inbox');
			} else {
				// Lastly, create the default homepage for the inbox
				var newHomepage = new Homepage();
				newHomepage.summaryKeywords = [];
				newHomepage._inbox = inbox._id;
				newHomepage._account = req.session.userprofile.account._id;
				newHomepage.save(function(error, homepage) {
					if (error) {
						callback(error);
					} else {
						log.info('|inbox.create.save| New inbox created -> ' + inbox._id, widget);				
						res.send(JSON.stringify({ result: inbox }));
					}
				});
			}
		});
	} catch (error) {
		log.error('|inbox.create| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error while creating inbox');
	}
};


exports.update = function(req, res) {
	try {
		log.info('|inbox.update|', widget);
		
		var accountID = req.session.userprofile.account._id;
		var inboxID = req.body._id;

		log.info('|inbox.update| Updating inbox  -> ' + accountID, widget);
		Inbox.findOne({ _account: accountID, _id: inboxID })
    		.exec(
    		function(error, inbox) {
	    		if (error) {
					log.error('|inbox.update.findById| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error occurred updating inbox');
				} else {			
					inbox.description = req.body.description;
			 		inbox.public_title = req.body.public_title;
					inbox.status = req.body.status;
					inbox._watchers = req.body._watchers;

			    	inbox.save(function(error, updatedInbox){
						if (error) {
							log.error('|inbox.update.save| Unknown  -> ' + error, widget);
							utility.errorResponseJSON(res, 'Error occurred updating inbox');
						} else {
							log.info('|inbox.update| Success  -> ' + updatedInbox._id, widget);
							res.send(JSON.stringify({ result: updatedInbox }));
						} 
			    	});
				}
	    	}
	    );
	} catch (error) {
		log.error('|inbox.update| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error while updating inbox');
	}
};


exports.delete = function(req, res) {
	try {
		log.info('|inbox.delete|', widget);
		
		var accountID = req.session.userprofile.account._id;
		var inboxIDs = req.body.inboxIDs;

		log.info('|inbox.delete| Deleting inboxes  -> ' + inboxIDs, widget);

		// First, delete the inboxes.
		var inboxDeleteQuery = { _id: { $in: inboxIDs }, _account: accountID };			
    	Inbox.remove(inboxDeleteQuery, function(error) {
    		if (error) {
				log.error('|inbox.delete.remove| Unknown  -> ' + error, widget);
				utility.errorResponseJSON(res, 'Error occurred deleting inboxes');
			} else {
				// Then, delete any homepages for those inboxes.
				var homepageDeleteQuery = { _inbox: { $in: inboxIDs } };			
		    	Homepage.remove(homepageDeleteQuery, function(error) {
		    		if (error) {
						log.error('|inbox.delete.homepage.remove| Unknown  -> ' + error, widget);
						utility.errorResponseJSON(res, 'Error occurred deleting inbox homepages');
					} else {
						res.send(JSON.stringify({result: true}));
					}
		    	});
			}
    	});

	} catch (error) {
		log.error('|inbox.delete| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error occurred deleting inboxes');
	}
};


exports.resetToken = function(req, res) {
	try {
		log.info('|inbox.resetToken|', widget);
		var inboxID = req.body.inboxID;
		var accountID = req.session.userprofile.account._id;

		var error = null;
		if (validator.checkNull(inboxID)) {
			error = 'Inbox ID is Null';
		} 

		if (error) {
			log.error('|inbox.resetToken| ' + error, widget);
			return utility.errorResponseJSON(res, 'Error trying to reset inbox token');
		}

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


exports.toggleStatus = function(req, res) {
	try {
		log.info('|inbox.toggleStatus|', widget);
		var inboxID = req.body.inboxID;
		var status = req.body.status;
		var accountID = req.session.userprofile.account._id;

		var error = null;
		if (validator.checkNull(inboxID)) {
			error = 'Inbox ID is Null';
		} 

		if (error) {
			log.error('|inbox.toggleStatus| ' + error, widget);
			return utility.errorResponseJSON(res, 'Error trying to reset inbox token');
		}

		log.info('|inbox.toggleStatus| Changing inbox status -> ' + inboxID + ' to: ' + status, widget);
		Inbox.findOne({ _account: accountID, _id: inboxID })
			.exec(
			function (error, inbox) {
				if (error) {
					log.error('|inbox.toggleStatus.findOne| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error occurred getting inbox');
				} else if(!inbox) {
					log.info('|inbox.toggleStatus| Inbox not found -> ' + inboxID, widget);	
					utility.errorResponseJSON(res, 'Inbox not found');
				} else {		
					log.info('|inbox.toggleStatus| Inbox found -> ' + inbox._id, widget);	

					inbox.status = status;
					inbox.save(function(error){
						if(error) {
							log.error('|inbox.toggleStatus.save| Unknown  -> ' + error, widget);
							utility.errorResponseJSON(res, 'Error occurred changing inbox status');
						} else {
							log.info('|inbox.toggleStatus| Inbox status saved -> ' + inbox._id, widget);	
							res.send(JSON.stringify({ result: inbox }));
						}
					});
				}
			}
		);
	} catch (error) {
		log.error('|inbox.toggleStatus| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error trying to change inbox status');
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

		Inbox.findOne({ number: inboxNumber, token: token })
			.select('-token -updated_at -created_at -_watchers -_version')
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
		var accountID = req.session.userprofile.account._id;
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
		var inboxID = req.query.inboxID;
		var accountID = req.session.userprofile.account._id;

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
		var accountID = req.session.userprofile.account._id;

		var fileName = inboxID;
		var fileType = req.query.fileType;
		var bucketName = 'workwoo-inbox-images';

		aws.getSignedS3URL(fileName, fileType, bucketName, function(error, signedRequest){
			if(error || !signedRequest) {
				log.error('|inbox.getSignedImageURL| Error while getting signed request -> ' + error, widget);
				utility.errorResponseJSON(res, 'Error while getting signed request');
			} else {
				// Save the new image URL to the inbox record
				Inbox.findOne({ _id: inboxID, _account: accountID })
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