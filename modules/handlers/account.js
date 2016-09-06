var cfg = require('../../config/config');
var Account = require('../models/account');
var aws = require('../../utils/aws-utils')
var validator = require('../../utils/validator');
var utility = require('../../utils/utility');
var log = require('../../utils/logger');
var widget = 'account';
log.registerWidget(widget);

exports.update = function(req, res) {
	try {
		// TODO: Scrub incoming 
		var accountID = req.session.userprofile.account._id;
		log.info('|account.update| Updating account  -> ' + accountID, widget);

		Account.findById(accountID)
    		.exec(
    		function(error, account) {
	    		if (error) {
					log.error('|account.update.findById| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error occurred updating account');
				} else {			
					account.name = req.body.name;
			 		account.city = req.body.city;
					account.state = req.body.state;
					account.country = req.body.country;
					account.email = req.body.email;
					account.phone = req.body.phone;

			    	account.save(function(error){
						if (error) {
							log.error('|account.update.save| Unknown  -> ' + error, widget);
							utility.errorResponseJSON(res, 'Error occurred updating account');
						} else {
							// Repopulate the primary inbox info
							account.populate('_primary_inbox', function(error) {
								if(error) {
									log.error('|account.update.save.populate| Unknown  -> ' + error, widget);
									utility.errorResponseJSON(res, 'Error occurred populating primary inbox');
								} else {
									log.info('|account.update| Success  -> ' + account._id, widget);
									req.session.userprofile.account = account;
									res.send(JSON.stringify({ result: account }));
								}
							});
						} 
			    	});
				}
	    	}
	    );
	} catch (error) {
		log.error('|account.update| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error while updating account');
	}
};

// Update the logo on the account only after the upload is successful ------------------------------------- TODO
exports.getSignedLogoURL = function(req, res) {
	try {
		var accountID = req.session.userprofile.account._id;
		log.info('|account.getSignedLogoURL| Updating logo for account  -> ' + accountID, widget);
		var fileName = accountID + '?v=1';
		var fileType = req.query.fileType;
		var bucketName = 'workwoo-account-logos';

		aws.getSignedS3URL(fileName, fileType, bucketName, function(error, signedRequest){
			if(error || !signedRequest) {
				log.error('|account.getSignedLogoURL| Error while getting signed request -> ' + error, widget);
				utility.errorResponseJSON(res, 'Error while getting signed request');
			} else {
				// Save the new logo URL to the account
				Account.findById(accountID)
		    		.exec(
		    		function(error, account) {
			    		if (error) {
							log.error('|account.getSignedLogoURL.findById| Unknown  -> ' + error, widget);
							utility.errorResponseJSON(res, 'Error occurred updating logo');
						} else {
							log.info('Updating logo to: ' + signedRequest.url);
							account.logo = signedRequest.url;
					    	account.save(function(error){
								if (error) {
									log.error('|account.getSignedLogoURL.save| Unknown  -> ' + error, widget);
									utility.errorResponseJSON(res, 'Error occurred updating logo');
								} else {
									// Finally, save the logo in session and send the signed request info
									req.session.userprofile.account.logo = signedRequest.url;
									log.info('|account.getSignedLogoURL.save| Logo save success', widget);
									res.send(JSON.stringify({ result: signedRequest }));
								} 
					    	});
						}
			    	}
			    );
			}
		});
	} catch (error) {
		log.error('|account.getSignedLogoURL| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error while getting signed request');
	}
};

