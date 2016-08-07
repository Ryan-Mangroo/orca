// Config
var cfg = require('../../config/config');

var crypto = require('crypto');

// Mongoose
var User = require('../models/user');
var Account = require('../models/account');
var Counter = require('../models/counter');
//var NotificationTemplate = require('workwoo-utils').notificationTemplate;

// Custom modules
//var mailer = require('workwoo-utils').mailer;
var utility = require('../../utils/utility');
var validator = require('../../utils/validator');
var log = require('../../utils/logger');
var widget = 'auth';
log.registerWidget(widget);

exports.verifyCredentials = function(email, password, callback) {
	try {
		var errors = {};
		if (validator.checkNull(email)) { errors.email = 'Email Address is Null'; } 
		else if (!validator.checkEmail(email)) { errors.email = 'Email is not valid: ' + email; } 
		
		if (validator.checkNull(password)) { errors.password = 'Password is Null'; }

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
				number: user.number,
				phone: user.phone
			};

			return callback(null, userSession);
		});

	} catch (error) {
		log.error('|auth.verifyCredentials| Unknown -> ' + error, widget);
		return callback(error);
	}
};


function createAccount(accountName, callback) {
	var newAccount = new Account();
	newAccount.name = accountName;
	newAccount.streetAddress = '';
	newAccount.city = '';
 	newAccount.state = '';
 	newAccount.country = '';
 	newAccount.zip = '';
 	newAccount.email = '';
 	newAccount.accountType = '0';

	newAccount.save(function(error, account) {
		if (error) {
			callback(error);
		} else {
			callback(null, account._id);
		}
	});
};


/*
function createCounter(orgId, prefix, col, callback) {
	var newCounter = new Counter();
	newCounter.col = col;
	newCounter.prefix = prefix;	
	newCounter._org = orgId;
	//newCounter._created_by = '56d67d7ee4b035e540be4bfd'; // System Account, move to config

	newCounter.save(function(error, counter) {
		if (error) {
			callback(error);
		} else {
			callback(null);
		}
	});
}
*/


function createUser(req, acccountID, callback) {
	var newUser = new User();
	newUser.firstName = req.body.firstName;
	newUser.lastName = req.body.lastName;
	newUser.email = req.body.newEmail;
	newUser.state = 'active';
	newUser.password = req.body.newPassword;
	newUser._account = acccountID;

	//var token = crypto.randomBytes(64).toString('hex');
	//newUser.verified = false;
	//newUser.verifyToken = token;
	//newUser.newUser = true;

	//newUser._created_by = '56d67d7ee4b035e540be4bfd'; // System Account, move to config
	//newUser._updated_by = '56d67d7ee4b035e540be4bfd';

	newUser.save(function(error, user) {
		if (error) {
			callback(error);
		} else {
			callback(null, user);
		}
	});
}


exports.signupRequest = function(req, res) {
	try {
		createAccount(req.body.accountName, function (error, accountID) {
			if (error) {
				log.error('|auth.signupRequest.createAccount| Unknown  -> ' + error, widget);
				return utility.errorResponseJSON(res, 'Error occurred creating account');
			} else {
				createUser(req, accountID, function (error, user) {
					if (error) {
						log.error('|auth.signupRequest.createUser| Unknown  -> ' + error, widget);
						return utility.errorResponseJSON(res, 'Error occurred creating user');
					} else {
						/*
						NotificationTemplate.findOne({name: cfg.mailer.signupTemplate}, function (error, notificationTemplate) {
							if (error) {
								log.error('|auth.signupRequest.NotificationTemplate| Unknown -> ' + error, widget);
								return utility.errorResponseJSON(res, 'Error while retrieving signup template');
							} else {
								notificationTemplate.html = notificationTemplate.html.replace(cfg.mailer.tokenPlaceholder, user.verifyToken);
								notificationTemplate.html = notificationTemplate.html.replace(cfg.mailer.hostNamePlaceholder, cfg.hostname);
								mailer.sendMail(notificationTemplate, {to: user.email}, user._id);								
								return res.send(JSON.stringify({result: true}));
							}
						});
						*/
						return res.send(JSON.stringify({ result: true }));
					}
				});
			}
		});
	} catch (error) {
		log.error('|auth.signupRequest| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error while processing signup request');
	}
};


/*
exports.forgotPasswordRequest = function(req, res) {
	try {
		var emailAddress = req.body.emailAddress;

		var error = null;
		if (validator.checkNull(emailAddress)) { error = 'Email Address is Null'; } 
		else if (!validator.checkEmail(emailAddress)) { error = 'Email Address is not valid: ' + emailAddress; } 

		if (error) {
			log.error('|auth.forgotPasswordRequest| ' + error, widget);
			return utility.errorResponseJSON(res, 'Error while processing forgot password request');
		}

		log.info('|auth.forgotPasswordRequest| Email -> ' + emailAddress, widget);
		
		User.forgotPassword(emailAddress, function (error, user, token){
			if (error) {
				log.error('|auth.forgotPasswordRequest.forgetPassword| Unknown -> ' + error, widget);
				return utility.errorResponseJSON(res, 'Error while processing forgot password request');
			}

			if (!user.emailAddress) { 
				log.error('|auth.forgotPasswordRequest.forgetPassword| User not found -> ' + emailAddress, widget);
				return res.send(JSON.stringify({result: false}));
			}

			NotificationTemplate.findOne({name: cfg.mailer.forgotPasswordTemplate}, function (error, notificationTemplate) {
				if (error) {
					log.error('|auth.forgotPasswordRequest.NotificationTemplate| Unknown -> ' + error, widget);
					return utility.errorResponseJSON(res, 'Error while processing forgot password request');
				} else {
					notificationTemplate.html = notificationTemplate.html.replace(cfg.mailer.tokenPlaceholder, token);
					notificationTemplate.html = notificationTemplate.html.replace(cfg.mailer.hostNamePlaceholder, cfg.hostname);	
					mailer.sendMail(notificationTemplate, {to: user.emailAddress}, user._id);
				}
			});

		    return res.send(JSON.stringify({result: true}));
		});
	} catch (error) {
		log.error('|auth.forgotPasswordRequest| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error while processing forgot password request');
	}
};
*/

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


