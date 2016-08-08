// Config
var cfg = require('../../config/config');

// Mongoose
var Account = require('../models/account');

// Custom modules
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
							// Repopulate the primary box info
							account.populate('_primary_box', function(error) {
								if(error) {
									log.error('|account.update.save.populate| Unknown  -> ' + error, widget);
									utility.errorResponseJSON(res, 'Error occurred populating primary box');
								} else {
									log.info('|account.update| Success  -> ' + account._id, widget);
									req.session.userprofile.account = account;
									res.send(JSON.stringify({ result: account }));
								}
							});
						} 
			    	});
				}
	    	});
	} catch (error) {
		log.error('|account.update| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error while updating account');
	}
};