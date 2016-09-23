var cfg = require('../../config/config');
var crypto = require('crypto');
var User = require('../models/user');
var Account = require('../models/account');
var Inbox = require('../models/inbox');
var Homepage = require('../models/homepage');
var NotificationTemplate = require('../models/notificationtemplate');

var mailer = require('../../utils/mailer');

var utility = require('../../utils/utility');
var validator = require('../../utils/validator');
var log = require('../../utils/logger');
var widget = 'auth';
log.registerWidget(widget);

exports.verifyCredentials = function(email, password, callback) {
	try {
		log.info('|auth.verifyCredentials|', widget);
		var errors = {};
		if (validator.checkNull(email)) {
			errors.email = 'Email Address is Null';
		} else if (!validator.checkEmail(email)) {
			errors.email = 'Email is not valid: ' + email;
		} 
		
		if (validator.checkNull(password)) {
			errors.password = 'Password is Null';
		}

		if (!validator.checkEmptyObject(errors)) {
			log.error('|auth.verifyCredentials.authenticate| ' + JSON.stringify(errors), widget);
			return callback('Error while verifying credentials');		
		}

		log.info('|auth.verifyCredentials| Email -> ' + email, widget);
		User.authenticate(email, password, function(error, user){
			if (error) {
				log.error('|auth.verifyCredentials.authenticate| Unknown -> ' + error, widget);
				return callback(error);
			}
			if (!user) {
				log.error('|auth.verifyCredentials.authenticate| User not found or password incorrect -> ' + email, widget);
				return callback(null, false);
			}

			log.info('|auth.verifyCredentials.authenticate| User credentials verified -> ' + email, widget);
			var userSession = {
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				id: user.id,
				account: user._account,
				phone: user.phone,
				role: user.role
			};
			return callback(null, userSession);
		});
	} catch (error) {
		log.error('|auth.verifyCredentials| Unknown -> ' + error, widget);
		return callback(error);
	}
};


function createAccount(accountName, callback) {
	log.info('    Creating Account...', widget);
	var newAccount = new Account();
	newAccount.name = accountName;
	newAccount.streetAddress = '';
	newAccount.city = '';
 	newAccount.state = '';
 	newAccount.country = '';
 	newAccount.zip = '';
 	newAccount.email = '';
 	newAccount.accountType = '0';
 	newAccount.logo = 'https://workwoo-app-images.s3.amazonaws.com/default-account-logo.png';

	newAccount.save(function(error, account) {
		if (error) {
			callback(error);
		} else {
			callback(null, account);
		}
	});
};

function createUser(req, acccountID, callback) {
	log.info('    Creating User...', widget);
	var newUser = new User();
	newUser.firstName = req.body.firstName;
	newUser.lastName = req.body.lastName;
	newUser.email = req.body.email;
	newUser.state = 'active';
	newUser.role = 'Account Owner';
	newUser.password = req.body.newPassword; // Password rules <------------------------------------TODO
	newUser._account = acccountID;

	newUser.save(function(error, user) {
		if (error) {
			callback(error);
		} else {
			callback(null, user);
		}
	});
}

function createPrimaryInbox(req, acccountID, callback) {
	log.info('    Creating Primary Inbox...', widget);
	var newInbox = new Inbox();
	newInbox.description = 'Companywide Feedback Inbox';
	newInbox.public_title = 'Anonymously Share Your Thoughts';
	newInbox.status = 'active';
	newInbox._account = acccountID;
	newInbox.image = 'https://workwoo-app-images.s3.amazonaws.com/default-inbox-image.png';

	newInbox.save(function(error, inbox) {
		if (error) {
			callback(error);
		} else {
			callback(null, inbox);
		}
	});
}

function createAccountHomepage(req, inboxID, acccountID, callback) {
	log.info('    Creating Homepage...', widget);
	var newHomepage = new Homepage();
	newHomepage.summaryKeywords = [];
	newHomepage._inbox = inboxID;
	newHomepage._account = acccountID;
	newHomepage.save(function(error, homepage) {
		if (error) {
			callback(error);
		} else {
			callback(null, homepage);
		}
	});
}

// Null checks, dup email checks ----------------------------------------------------------------------------------- TODO
exports.signup = function(req, res) {
	try {
		log.info('Creating Account for: ' + req.body.accountName, widget);
		createAccount(req.body.accountName, function (error, account) {
			if (error) {
				log.error('|auth.signup.createAccount| Unknown  -> ' + error, widget);
				return utility.errorResponseJSON(res, 'Error occurred creating account');
			} else {

				createUser(req, account._id, function (error, user) {
					if (error) {
						log.error('|auth.signup.createUser| Unknown  -> ' + error, widget);
						return utility.errorResponseJSON(res, 'Error occurred creating user');
					} else {

						createPrimaryInbox(req, account._id, function (error, inbox) {
							if (error) {
								log.error('|auth.signup.createPrimaryInbox| Unknown  -> ' + error, widget);
								return utility.errorResponseJSON(res, 'Error occurred creating primary inbox');
							} else {

								// Re-query for the new account so we can save it's new primary inbox
								Account.findById(account._id).exec(
									function(error, newAccount) {
										if (error) {
											log.error('|user.update.findById| Unknown  -> ' + error, widget);
											utility.errorResponseJSON(res, 'Error occurred updating user');
										} else {			
											newAccount._primary_inbox = inbox._id;
									    	newAccount.save(function(error){
												if (error) {
													log.error('|auth.signup.createPrimaryInbox| Unknown  -> ' + error, widget);
													utility.errorResponseJSON(res, 'Error updating account with new inbox');
												} else {
													// Finally, create the empty homepage for them to configure on the first visit
													createAccountHomepage(req, inbox._id, account._id, function (error, homepage) {
														if (error) {
															log.error('|auth.signup.createAccountHomepage| Unknown  -> ' + error, widget);
															return utility.errorResponseJSON(res, 'Error occurred creating homepage');
														} else {

															log.info('Account successfully created for ' + account.name + ' -> ' + account._id, widget);
															
															NotificationTemplate.findOne({name: cfg.mailer.signupTemplate}, function (error, notificationTemplate) {
																if (error) {
																	log.error('|auth.signupRequest.NotificationTemplate| Unknown -> ' + error, widget);
																	return utility.errorResponseJSON(res, 'Error while retrieving signup template');
																} else {
																	notificationTemplate.html = notificationTemplate.html.replace(cfg.mailer.tokenPlaceholder, user.verifyToken);
																	notificationTemplate.html = notificationTemplate.html.replace(cfg.mailer.hostNamePlaceholder, cfg.hostname);
																	mailer.sendMail(notificationTemplate, {to: user.email}, user._id);								
																	return res.send(JSON.stringify({ result: true }));
																}
															});
														
															
														}
													});
												}
											});
										}
									}
								);
							}
						});
					}
				});
			}
		});
	} catch (error) {
		log.error('|auth.signup| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error while processing signup');
	}
};


exports.requestPasswordReset = function(req, res) {
	try {
		log.info('|auth.requestPasswordReset|', widget);

		var emailAddress = req.body.emailAddress;

		var error = null;
		if (validator.checkNull(emailAddress)) {
			error = 'Email Address is Null';
		} else if (!validator.checkEmail(emailAddress)) {
			error = 'Email Address is not valid: ' + emailAddress;
		} 

		if (error) {
			log.error('|auth.requestPasswordReset| -> ' + error, widget);
			return utility.errorResponseJSON(res, 'Error while processing forgot password request');
		}

		log.info('|auth.requestPasswordReset| Password reset requested -> ' + emailAddress, widget);
		
		User.requestPasswordReset(emailAddress, function (error, user, token){
			if (error) {
				log.error('|auth.requestPasswordReset.requestPasswordReset| Unknown -> ' + error, widget);
				return utility.errorResponseJSON(res, 'Error while requesting password reset');
			}

			if (!user.email) { 
				log.error('|auth.requestPasswordReset.requestPasswordReset| User not found -> ' + emailAddress, widget);
				return res.send(JSON.stringify({ result: false }));
			}

			NotificationTemplate.findOne({ name: cfg.mailer.forgotPasswordTemplate }, function (error, notificationTemplate) {
				if (error) {
					log.error('|auth.requestPasswordReset.NotificationTemplate| Unknown -> ' + error, widget);
					return utility.errorResponseJSON(res, 'Error while getting password reset email template');
				} else {

					// Send an email user's email containing the tokenized link to reset their password
					notificationTemplate.html = notificationTemplate.html.replace(cfg.mailer.tokenPlaceholder, token);
					notificationTemplate.html = notificationTemplate.html.replace(cfg.mailer.hostNamePlaceholder, cfg.hostname);	
					mailer.sendMail(notificationTemplate, {to: user.email}, user._id);
				}
			});

		    return res.send(JSON.stringify({result: true}));
		});
	} catch (error) {
		log.error('|auth.requestPasswordReset| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error while requesting password reset');
	}
};


/*
exports.resetPasswordRequest = function(req, res) {
	try {
		var newPassword = req.body.newPassword;
		var token = req.body.token;

		var errors = {};
		if (validator.checkNull(newPassword)) { errors.newPassword = 'New Password is Null'; } 
		if (validator.checkNull(token)) { errors.token = 'Reset Password Token is Null' } 

		if (!validator.checkEmptyObject(errors)) {
			log.error('|auth.resetPasswordRequest| ' + JSON.stringify(errors), widget);
			return utility.errorResponseJSON(res, 'Error while resetting password');
		}
		
		var passwordComplexityResult = validator.checkPasswordComplexity(newPassword);

		for (var option in passwordComplexityResult) {
			if (!passwordComplexityResult[option]) {
				log.error('|auth.resetPasswordRequest| Password complexity check failed: ' + JSON.stringify(passwordComplexityResult), widget);
				return utility.errorResponseJSON(res, 'Error while resetting password');
			}
		}

		log.info('|auth.resetPasswordRequest| Token -> ' + token, widget);

		User.resetPassword(token, newPassword, function(error, user) {
			if (error) {
				log.error('|auth.resetPasswordRequest.resetPassword| Unknown -> ' + error, widget);
				return utility.errorResponseJSON(res, 'Error while resetting password');
			}

			if (!user.emailAddress) { 
				log.error('|auth.resetPasswordRequest.resetPassword| User not found for token -> ' + token, widget);
				return utility.errorResponseJSON(res, 'Error while resetting password');
			}

			NotificationTemplate.findOne({name: cfg.mailer.resetPasswordTemplate}, function (error, notificationTemplate) {
				if (error) {
					log.error('|auth.resetPasswordRequest.NotificationTemplate| Unknown -> ' + error, widget);
					return utility.errorResponseJSON(res, 'Error while resetting password');
				} else {
					mailer.sendMail(notificationTemplate, {to: user.emailAddress}, user._id);
				}
			});

		    return res.send(JSON.stringify({result: true}));
		});

	} catch (error) {
		log.error('|auth.resetPasswordRequest| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error while resetting password');
	}
};
*/


exports.verifyRequest = function(req, res) {
	try {
		var token = req.body.token;

		var error = null;
		if (validator.checkNull(token)) { error = 'Verify Token is Null'; } 

		if (error) {
			log.error('|auth.verifyRequest| ' + error, widget);
			return utility.errorResponseJSON(res, 'Error while verifying user');
		}
		
		log.info('|auth.verifyRequest| Token -> ' + token, widget);

		User.verify(token, function(error, user) {
			if (error) {
				log.error('|auth.verifyRequest.verify| Unknown -> ' + error, widget);
				return utility.errorResponseJSON(res, 'Error while verifying user');
			}

			if (!user.email) { 
				log.error('|auth.verifyRequest.verify| User not found for token -> ' + token, widget);
				return utility.errorResponseJSON(res, 'Error while verifying user');
			}

			// TO DO: Welcome email??
/*
			NotificationTemplate.findOne({name: cfg.mailer.resetPasswordTemplate}, function (error, notificationTemplate) {
				if (error) {
					log.error('|auth.resetPasswordRequest.NotificationTemplate| Unknown -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error while resetting password');
				} else {
					mailer.sendMail(notificationTemplate, {to: user.emailAddress}, user._id);
				}
			});
*/
		    return res.send(JSON.stringify({result: true}));
		});

	} catch (error) {
		log.error('|auth.verifyRequest| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error while verifying user');
	}
};


