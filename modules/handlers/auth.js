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

function createPrimaryInbox(req, acccountID, userID, callback) {
	log.info('    Creating Primary Inbox...', widget);
	var newInbox = new Inbox();
	newInbox.description = 'Feedback';
	newInbox.public_title = 'Share Your Thoughts';
	newInbox.status = 'active';
	newInbox._account = acccountID;
	newInbox.image = 'https://workwoo-app-images.s3.amazonaws.com/default-inbox-image.png';
	newInbox._watchers = [userID];
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

						createPrimaryInbox(req, account._id, user._id, function (error, inbox) {
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
															NotificationTemplate.findOne({ name: cfg.mailer.signupTemplate }, function (error, notificationTemplate) {
																if (error) {
																	log.error('|auth.signupRequest.NotificationTemplate| Unknown -> ' + error, widget);
																	return utility.errorResponseJSON(res, 'Error while retrieving signup template');
																} else if(!notificationTemplate) {
																	log.error('|auth.signupRequest.NotificationTemplate| Signup template not found', widget);
																	return utility.errorResponseJSON(res, 'Signup temlpate not found');
																} else {
																	notificationTemplate.html = notificationTemplate.html.replace(cfg.mailer.firstNamePlaceholder, user.firstName);
																	notificationTemplate.html = notificationTemplate.html.replace(cfg.mailer.primaryInboxURLPlaceholder, inbox.number + '?t=' + inbox.token);
																	notificationTemplate.html = notificationTemplate.html.replace(cfg.mailer.primaryInboxURLPlaceholder, inbox.number + '?t=' + inbox.token);
																	mailer.sendMail(notificationTemplate, { to: user.email, bcc: 'jesse@workwoo.com' }, user._id);
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

		    return res.send(JSON.stringify({result: true}));
		});
	} catch (error) {
		log.error('|auth.requestPasswordReset| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error while requesting password reset');
	}
};


exports.resetPassword = function(req, res) {
	try {
		var newPassword = req.body.newPassword;
		var token = req.body.token;

		var errors = {};
		if (validator.checkNull(newPassword)) {
			errors.newPassword = 'Empty password';
		}

		if (validator.checkNull(token)) {
			errors.token = 'Empty token'
		} 

		if (!validator.checkEmptyObject(errors)) {
			log.error('|auth.resetPassword| ' + JSON.stringify(errors), widget);
			return utility.errorResponseJSON(res, 'Error resetting password');
		}
		
		var passwordComplexityResult = validator.checkPasswordComplexity(newPassword);
		for (var option in passwordComplexityResult) {
			if (!passwordComplexityResult[option]) {
				log.error('|auth.resetPassword| Password complexity check failed: ' + JSON.stringify(passwordComplexityResult), widget);
				return utility.errorResponseJSON(res, 'Error resetting password');
			}
		}

		log.info('|auth.resetPassword| Resetting password, Token -> ' + token, widget);

		User.resetPassword(token, newPassword, function(error, user) {
			if (error) {
				log.error('|auth.resetPassword.resetPassword| Unknown -> ' + error, widget);
				return utility.errorResponseJSON(res, 'Error resetting password');
			}

			if (!user.email) { 
				log.error('|auth.resetPassword.resetPassword| User not found -> ' + token, widget);
				return utility.errorResponseJSON(res, 'Error resetting password');
			}

			NotificationTemplate.findOne({ name: cfg.mailer.resetPasswordTemplate }, function (error, notificationTemplate) {
				if (error) {
					log.error('|auth.resetPassword.NotificationTemplate| Unknown -> ' + error, widget);
					return utility.errorResponseJSON(res, 'Error resetting password');
				} else if(!notificationTemplate) {
					log.error('|auth.resetPassword.NotificationTemplate| Email template not found', widget);
					return utility.errorResponseJSON(res, 'Email template not found');
				} else {
					mailer.sendMail(notificationTemplate, { to: user.email }, user._id);
				}
			});

		    return res.send(JSON.stringify({ result: true }));
		});

	} catch (error) {
		log.error('|auth.resetPassword| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error resetting password');
	}
};
