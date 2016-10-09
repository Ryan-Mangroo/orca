var cfg = require('../../config/config');
var User = require('../models/user');
var NotificationTemplate = require('../models/notificationtemplate');
var mailer = require('../../utils/mailer');
var utility = require('../../utils/utility');
var validator = require('../../utils/validator');
var log = require('../../utils/logger');
var widget = 'user-management';
log.registerWidget(widget);

exports.createNew = function(req, res) {
	try {
		var accountID = req.session.userprofile.account._id;
		log.info('|user.createNew| Creating user for account  -> ' + accountID, widget);

		var newUser = new User();
		newUser.firstName = req.body.firstName;
		newUser.lastName = req.body.lastName;
		newUser.email = req.body.emailAddress;
		newUser.role = req.body.role;
		newUser.state = 'active';
		newUser._account = accountID;
		newUser.password = String(Math.floor((Math.random() * 100000) + 1));

		log.info('    First Name: ' + newUser.firstName, widget);
		log.info('    Last Name: ' + newUser.lastName, widget);
		log.info('    Email: ' + newUser.email, widget);
		log.info('    Role: ' + newUser.role, widget);
		log.info('    Account: ' + newUser._account, widget);

		newUser.save(function(error, user) {
			if (error) {
				log.error('|user.createNew| Unknown  -> ' + error, widget);
				utility.errorResponseJSON(res, 'Error creating user');
			} else if(!user) {
				log.error('|user.createNew| User not created for account -> ' + accountID, widget);
				utility.errorResponseJSON(res, 'User not created for some reason');
			} else {

				// Before we call it good, we need to email the new user a password reset link
				User.requestPasswordReset(user.email, function (error, user, token){
					if (error) {
						log.error('|user.createNew.requestPasswordReset| Unknown -> ' + error, widget);
						return utility.errorResponseJSON(res, 'Error sending new user password reset');
					}
					NotificationTemplate.findOne({ name: cfg.mailer.forgotPasswordTemplate }, function (error, notificationTemplate) {
						if (error) {
							log.error('|auth.requestPasswordReset.NotificationTemplate| Unknown -> ' + error, widget);
							return utility.errorResponseJSON(res, 'Error while getting password reset email template');
						} else if(!notificationTemplate) {
							log.error('|auth.requestPasswordReset.NotificationTemplate| Template not found', widget);
							return utility.errorResponseJSON(res, 'Password reset email template not found');
						} else {
							// Send an email user's email containing the tokenized link to reset their password
							notificationTemplate.html = notificationTemplate.html.replace(cfg.mailer.tokenPlaceholder, token);
							notificationTemplate.html = notificationTemplate.html.replace(cfg.mailer.hostNamePlaceholder, cfg.hostname);	
							mailer.sendMail(notificationTemplate, { to: user.email }, user._id);
						}
					});
				});

				// Return even if the email has not sent... in case there's an error with our email setup
				return res.send(JSON.stringify({result: user}));		
			}
		});
	} catch (error) {
		log.error('|user.createNew| Unknown  -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error creating user');
	}
};


exports.update = function(req, res) {
	try {
		// TODO: Scrub incoming 
		var userID = req.body._id;
		var accountID = req.session.userprofile.account._id;

		log.info('|user.update| Updating user  -> ' + userID, widget);

		User.findOne({ _id: userID, _account: accountID, state: 'active' })
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
							log.info('|user.update| User updated  -> ' + userID, widget);
							return res.send(JSON.stringify({ result: true }));
						} 
			    	});
				}
	    	});
	} catch (error) {
		log.error('|user.update| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error while updating user');
	}
};


/*
 * To maintain referential integrity, we are going to simply "Deactivate"
 * the user by setting their state to inactive and their email address to a
 * dummy one. This would allow the same email to be used again in the future.
 */
exports.delete = function(req, res) {
	try {
		var userID = req.body.userID;
		var accountID = req.session.userprofile.account._id;
		log.info('|user.delete| Deleting user  -> ' + userID, widget);

		User.findOne({ _id: userID, _account: accountID })
    		.exec(
    		function(error, user) {
	    		if (error) {
					log.error('|user.delete.findOne| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error occurred deleting user');
				} else {			
					user.email = 'inactive_' + userID + '@workwoo.com';
					user.state = 'inactive';
					user.passwordResetToken = '';
					user.passwordResetTokenExp = '';

			    	user.save(function(error){
						if (error) {
							log.error('|user.delete.save| Unknown  -> ' + error, widget);
							utility.errorResponseJSON(res, 'Error occurrdeleteed deleting user');
						} else {
							log.info('|user.delete| User deleted  -> ' + userID, widget);
							return res.send(JSON.stringify({ result: true }));
						} 
			    	});
				}
	    	});
	} catch (error) {
		log.error('|user.delete| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error deleting user');
	}
};


exports.updateCurrentUser = function(req, res) {
	try {
		// TODO: Scrub incoming 
		var userID = req.body._id;
		var accountID = req.session.userprofile.account._id;
		log.info('|user.updateCurrentUser| Updating user  -> ' + userID, widget);

		User.findOne({ _id: userID, _account: accountID })
    		.exec(
    		function(error, user) {
	    		if (error) {
					log.error('|user.updateCurrentUser.findById| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error occurred updating currentuser');
				} else {			
					user.firstName = req.body.firstName;
			 		user.lastName = req.body.lastName;
					user.email = req.body.email;
					user.phone = req.body.phone;
					user.role = req.body.role;

			    	user.save(function(error){
						if (error) {
							log.error('|user.updateCurrentUser.save| Unknown  -> ' + error, widget);
							utility.errorResponseJSON(res, 'Error occurred updating current user');
						} else {
							// Repopulate the account & primary inbox info
							var accountPopulation = {
								path: '_account',
								model: 'Account'
							};
							user.populate(accountPopulation, function(error) {
								if(error) {
									log.error('|user.updateCurrentUser.save.populate| Unknown  -> ' + error, widget);
									utility.errorResponseJSON(res, 'Error occurred populating primary inbox');
								} else {
									log.info('|user.updateCurrentUser| Success  -> ' + user._id, widget);

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
		log.error('|user.updateCurrentUser| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error while updating current user');
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


/*
 * This function will get and return all users under the current user's account.
 * This is used by the "Users" section in the account settings page.
 */
exports.getAll = function(req, res) {
	try {
		var accountID = req.session.userprofile.account._id;
		log.info('|user.getAll| Getting users for account  -> ' + accountID, widget);

		User.find({ _account: accountID, state: 'active' })
			.select('-password -updated_at -created_at -_account -_version -passwordResetToken -passwordResetTokenExp')
    		.exec(
    		function(error, users) {
	    		if (error) {
					log.error('|user.getAll.find| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error getting users');
				} else {
					log.info('|user.getAll| Users found -> ' + users.length, widget);
					res.send(JSON.stringify({ result: users }));
				}
	    	}
	    );
	} catch (error) {
		log.error('|user.getAll.find| Unknown  -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error getting users');
	}
};



/*
 * This function will get and return the user for the given user ID.
 */
exports.getOne = function(req, res) {
	try {
		var accountID = req.session.userprofile.account._id;
		var userID = req.query.userID;
		log.info('|user.getOne| Getting user -> ' + userID, widget);
		User.findOne({ _account: accountID, _id: userID, state: 'active' })
			.select('-password -updated_at -created_at -_account -_version -passwordResetToken -passwordResetTokenExp')
    		.exec(
    		function(error, user) {
	    		if (error) {
					log.error('|user.getOne.findOne| Unknown  -> ' + error, widget);
					return utility.errorResponseJSON(res, 'Error getting user');
				} else if(!user) {
					log.info('|user.getOne.findOne| User not found -> ' + userID, widget);
					return utility.errorResponseJSON(res, 'User not found');
				} else {
					log.info('|user.getOne.findOne| User found -> ' + user._id, widget);
					return res.send(JSON.stringify({ result: user }));
				}
	    	}
	    );
	} catch (error) {
		log.error('|user.getOne| Unknown  -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error getting user');
	}
};
