var cfg = require('../../config/config');
var User = require('../models/user');
//var mailer = require('workwoo-utils').mailer;
var utility = require('../../utils/utility');
var validator = require('../../utils/validator');
var log = require('../../utils/logger');
var widget = 'user-management';
log.registerWidget(widget);

exports.update = function(req, res) {
	try {
		// TODO: Scrub incoming 
		var userID = req.body._id;
		var accountID = req.session.userprofile.account._id;
		log.info('|user.update| Updating user  -> ' + userID, widget);

		User.findOne({ _id: userID, _account: accountID })
    		.exec(
    		function(error, user) {
	    		if (error) {
					log.error('|user.update.findById| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error occurred updating user');
				} else {			
					user.firstName = req.body.firstName;
			 		user.lastName = req.body.lastName;
					user.email = req.body.email;
					user.phone = req.body.phone;
					user.role = req.body.role;

			    	user.save(function(error){
						if (error) {
							log.error('|user.update.save| Unknown  -> ' + error, widget);
							utility.errorResponseJSON(res, 'Error occurred updating user');
						} else {
							// Repopulate the account & primary inbox info
							var accountPopulation = {
								path: '_account',
								model: 'Account'
							};
							user.populate(accountPopulation, function(error) {
								if(error) {
									log.error('|user.update.save.populate| Unknown  -> ' + error, widget);
									utility.errorResponseJSON(res, 'Error occurred populating primary inbox');
								} else {
									log.info('|user.update| Success  -> ' + user._id, widget);

									// Reset session profile and return
									req.session.userprofile.firstName = user.firstName;
									req.session.userprofile.lastName = user.lastName;
									req.session.userprofile.email = user.email;
									req.session.userprofile.id = user._id;
									req.session.userprofile.account = user._account;
									req.session.userprofile.phone = user.phone;
									req.session.userprofile.role = user.role;

									res.send(JSON.stringify({ result: req.session.userprofile }));
								}
							});
						} 
			    	});
				}
	    	});
	} catch (error) {
		log.error('|user.update| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error while updating user');
	}
};


exports.changePassword = function(req, res) {
	try {
		log.info('|user.changePassword|', widget);

		var userID = req.session.userprofile.id;
		var currentPassword = req.body.current;
		var newPassword = req.body.new;

		var errors = {};
		if (validator.checkNull(currentPassword)) {
			errors.currentPassword = 'Current Password is Null';
		}

		if (validator.checkNull(newPassword)) {
			errors.newPassword = 'New Password is Null';
		} 

		if (!validator.checkEmptyObject(errors)) {
			log.error('|user.changePassword| ' + JSON.stringify(errors), widget);
			return utility.errorResponseJSON(res, 'Error occurred changing password');
		}

		var passwordComplexityResult = validator.checkPasswordComplexity(newPassword);
		for (var option in passwordComplexityResult) {
			if (!passwordComplexityResult[option]) {
				log.error('|user.changePassword| Password complexity check failed: ' + JSON.stringify(passwordComplexityResult), widget);
				return utility.errorResponseJSON(res, 'New Password failed complexity check');
			}
		}

		User.changePassword(accountID, userID, currentPassword, newPassword, function (error, user) {
			if (error) {
				log.error('|user.changePassword| Unknown  -> ' + error, widget);
				utility.errorResponseJSON(res, 'Error occurred changing password');
			} else {
				res.send(JSON.stringify({ result: true }));
			}
		});

	} catch (error) {
		log.error('|user.changePassword| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Error occurred changing password');
	}
};

exports.getUserProfile = function(req, res) {
	try {
		res.send(JSON.stringify(req.session.userprofile));
	} catch (error) {
		log.error('|user.getUserProfile| Unknown -> ' + error, widget);
	}
};
