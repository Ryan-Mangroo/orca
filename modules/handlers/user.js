// Config
var cfg = require('../../config/config');

// Mongoose
var User = require('../models/user');
var Acct = require('../models/account');

// Custom modules
//var mailer = require('workwoo-utils').mailer;
var utility = require('../../utils/utility');
var validator = require('../../utils/validator');
var log = require('../../utils/logger');
var widget = 'user-management';
log.registerWidget(widget);

/*
exports.setIsNewUser = function(req, res) {
	try {
		log.info('|user.setIsNewUser|', widget);

		var userId = req.session.userprofile.id;

		User.findById(userId, function(error, user) {
    		if (error) {
				log.error('|user.setIsNewUser.findById| Unknown  -> ' + error, widget);
				utility.errorResponseJSON(res, 'Error occurred setting is new user');
			} else {			
				user.newUser = req.body.setIsNewUser;

		    	user.save(function(error, user) {
		    		req.session.userprofile.newUser = user.newUser;
					res.send(JSON.stringify({result: true}));
		    	});
			}
    	});

	} catch (error) {
		log.error('|user.create| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Error occurred setting is new user');
	}
};
*/

/*
exports.create = function(req, res) {
	try {
		log.info('|user.create|', widget);

		// TODO: Scrub request body

		var newUser = new User();

		newUser.firstName = req.body.user.firstName;
 		newUser.lastName = req.body.user.lastName;
		newUser.emailAddress = req.body.user.emailAddress;
		newUser.phone = req.body.user.phone;
		newUser.role = req.body.user.role;
		newUser.state = 'active';

		newUser.password = req.body.user.password;
		newUser._org = req.session.userprofile.org._id;
		newUser._created_by = req.session.userprofile.id;
    	newUser._updated_by = req.session.userprofile.id;
						
    	newUser.save(function(error, user) {
    		if (error) {
				log.error('|user.create.save| Unknown  -> ' + error, widget);
				utility.errorResponseJSON(res, 'Error occurred creating user');
			} else {
				log.info('|user.create| New user created -> ' + user._id, widget);				
				res.send(JSON.stringify({ user: user }));
			}
    	});

	} catch (error) {
		log.error('|user.create| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Error occurred creating user');
	}
};
*/

/*

exports.update = function(req, res) {
	try {
		log.info('|user.update|', widget);

		var validationResult = validateUserRequest(req, false);

		if (validationResult.hasErrors) {
			log.error('|auth.update| ' + JSON.stringify(validationResult.errors), widget);
			return utility.errorResponseJSON(res, 'Error occurred updating user');
		}

		var userId = req.body.user._id;
			
    	User.findById(userId, '-password -resetPwdToken -resetPwd -resetPwdExpiration -verifyToken -verified')
    		.exec(
    		function(error, user) {
	    		if (error) {
					log.error('|user.update.findById| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error occurred updating user');
				} else {			
					user.firstName = req.body.user.firstName;
			 		user.lastName = req.body.user.lastName;
					user.emailAddress = req.body.user.emailAddress;
					user.phone = req.body.user.phone;
					user.role = req.body.user.role;
					user.state = req.body.user.state;
			    	user._updated_by = req.session.userprofile.id;

			    	user.save(function(error, user) {
						res.send(JSON.stringify(user));
			    	});
				}
	    	});

	} catch (error) {
		log.error('|user.update| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Error occurred updating user');
	}
};
*/

/*

exports.deleteMultiple = function(req, res) {
	try {
		log.info('|user.deleteMultiple|', widget);

		// TODO: Scrub request body
		var userIDs = req.body.users;

		log.info('|user.deleteMultiple| Deleting users: ' + userIDs, widget);

		var query = { _id: { $in: userIDs } };			
    	User.remove(query, function(error) {
    		if (error) {
				log.error('|user.deleteMultiple.remove| Unknown  -> ' + error, widget);
				utility.errorResponseJSON(res, 'Error occurred deleting users');
			} else {			
				res.send(JSON.stringify({result: true}));
			}
    	});

	} catch (error) {
		log.error('|user.deleteMultiple| -> ' + error, widget);
		utility.errorResponseJSON(res, 'Error occurred deleting users');
	}
};

*/

/*
exports.getUser = function(req, res) {
	try {
		log.info('|user.getUser|', widget);

		var userNumber = req.query.userNumber;

		var error = null;

		if (validator.checkNull(userNumber)) { error = "User Number is Null"; }
		else if (!validator.checkAlphanumeric(userNumber)) { error = "User Number is invalid"; }

		if (error) {
			log.error('|user.getUser| ' + error, widget);
			return utility.errorResponseJSON(res, 'Error occurred getting user');
		}

		log.info('|user.getUser| Getting user -> ' + userNumber, widget);

		var query = {
			_org: req.session.userprofile.org._id,
			number: userNumber
		};

		User.findOne(query, '-password -resetPwdToken -resetPwd -resetPwdExpiration -verifyToken -verified')
			.populate('_org _created_by _updated_by')
			.exec(
			function (error, user) {
				if (error) {
					log.error('|user.getUser.findOne| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error occurred getting user');
				} else {		
					log.info('|user.getUser| User found -> ' + user);	
					res.send(JSON.stringify({ user: user }));
				}
			});
	} catch (error) {
		log.error('|user.getUser| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Error occurred getting users');
	}
};
*/

/*
exports.getAll = function(req, res) {
	try {
		log.info('|user.getAll|', widget);

		var orgID = req.session.userprofile.org._id;

		User.find({_org: orgID}, '-password -resetPwdToken -resetPwd -resetPwdExpiration -verifyToken -verified')
			.populate('_org _created_by _updated_by')
			.exec(
			function (error, users) {
				if (error) {
					log.error('|user.getAll.find| Unknown -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error occurred getting users');
				} else {			
					res.send(JSON.stringify({ users: users }));
				}
			});
	} catch (error) {
		log.error('|user.getAll| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Error occurred getting users');
	}
};
*/

/*
var validateUserRequest = function(req, performOrgValidation) {
	var errors = {};

	var userErrors = validateUser(req.body.user);		
	if (!validator.checkEmptyObject(userErrors)) {
		errors.user = userErrors;
	}

	if (performOrgValidation) {
		var orgErrors = validateOrg(req.body.org);	
		if (!validator.checkEmptyObject(orgErrors)) {
			errors.org = orgErrors;
		}
	}
	
	if (!validator.checkEmptyObject(errors)) {
		return { hasErrors: true, errors: errors };
	}

	return { hasErrors: false };
};

var validateUser = function(obj) {
	var errors = {};

	if (validator.checkNull(obj._id)) {errors._id = "UserId is Null";}
	else if (!validator.checkMongoId(obj._id)) {errors._id = "UserId is not valid: " + obj._id;}

	if (validator.checkNull(obj.firstName)) {errors.firstName = "First name is Null";}
	else if (!validator.checkAlpha(obj.firstName)) {errors.firstName = "First name can only contain letters";}

	if (validator.checkNull(obj.lastName)) {errors.lastName = "Last name is Null";}	
	else if (!validator.checkAlpha(obj.lastName)) {errors.lastName = "Last name can only contain letters";}

	if (validator.checkNull(obj.emailAddress)) { errors.emailAddress = 'Email address is Null'; } 
	else if (!validator.checkEmail(obj.emailAddress)) { errors.emailAddress = 'Email address is not valid: ' + obj.emailAddress; } 

	if (!validator.checkNull(obj.phone) && !validator.checkMobilePhone(obj.phone)) { errors.phone = 'Phone is not valid: ' + obj.phone; } 

	return errors;
};

var validateOrg = function(obj) {
	var errors = {};

	if (validator.checkNull(obj.name)) {errors.name = "Organization name is null";}

	if (!validator.checkNull(obj.emailAddress) && !validator.checkEmail(obj.emailAddress)) { errors.emailAddress = 'Email address is not valid: ' + obj.emailAddress; } 

	if (!validator.checkNull(obj.phone) && !validator.checkMobilePhone(obj.phone)) { errors.phone = 'Phone is not valid: ' + obj.phone; } 

	// TODO: Address validation

	return errors;
};
*/

/*
exports.updateMyAccount = function(req, res) {
	try {
		log.info('|user.updateMyAccount|', widget);

		var validationResult = validateUserRequest(req, true);

		if (validationResult.hasErrors) {
			log.error('|auth.updateMyAccount| ' + JSON.stringify(validationResult.errors), widget);
			return utility.errorResponseJSON(res, 'Error occurred updating my account');
		}

		var userId = req.session.userprofile.id;
		User.findById(userId, function(error, user) {
    		if (error) {
				log.error('|user.updateMyAccount.user.findById| Unknown  -> ' + error, widget);
				utility.errorResponseJSON(res, 'Error occurred updating my account');
			} else {			
				user.firstName = req.body.user.firstName;
		 		user.lastName = req.body.user.lastName;
				user.emailAddress = req.body.user.emailAddress;
				user.phone = req.body.user.phone;

		    	user._updated_by = userId;

		    	user.save(function(error, user) {
		    		if (error) {
		    			log.error('|user.updateMyAccount.user.save| Unknown  -> ' + error, widget);
						utility.errorResponseJSON(res, 'Error occurred updating my account');
		    		} else {
		    			var orgID = req.session.userprofile.org._id;
		    			Org.findById(orgID, function(error, org) {
			    			if (error) {
								log.error('|user.updateMyAccount.org.findById| Unknown  -> ' + error, widget);
								utility.errorResponseJSON(res, 'Error occurred updating my account');
							} else {
								org.name = req.body.org.name;
								org.emailAddress = req.body.org.emailAddress;
								org.phone = req.body.org.phone;
								org.streetAddress = req.body.org.street;
								org.city = req.body.org.city;
								org.state = req.body.org.state;
								org.zip = req.body.org.zip;
								org.country = req.body.org.country;
								org._updated_by = userId;
								
								org.save(function(error, org) {
									if (error) {
										log.error('|user.updateMyAccount.org.save| Unknown  -> ' + error, widget);
										utility.errorResponseJSON(res, 'Error occurred updating my account');
									} else {
										req.session.userprofile.firstName = user.firstName;
										req.session.userprofile.lastName = user.lastName;
										req.session.userprofile.emailAddress = user.emailAddress;
										req.session.userprofile.phone = user.phone;
										req.session.userprofile.org = org;
										res.send(JSON.stringify({result: true}));
									}
								});
							}
			    		});
		    		}
		    	});
			}
    	});
	} catch (error) {
		log.error('|user.updateMyAccount| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Error occurred updating my account');
	}
};
*/

/*
exports.changePassword = function(req, res) {
	try {
		log.info('|user.changePassword|', widget);

		var userId = req.session.userprofile.id;
		var currentPassword = req.body.user.currentPassword;
		var newPassword = req.body.user.newPassword;

		var errors = {};
		if (validator.checkNull(currentPassword)) { errors.currentPassword = 'Current Password is Null'; } 
		if (validator.checkNull(newPassword)) { errors.newPassword = 'New Password is Null'; } 

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

		User.changePassword(userId, currentPassword, newPassword, function (error, user) {
			if (error) {
				log.error('|user.changePassword| Unknown  -> ' + error, widget);
				utility.errorResponseJSON(res, 'Error occurred changing password');
			} else {
				res.send(JSON.stringify({result: true}));
			}
		});
		
	} catch (error) {
		log.error('|user.changePassword| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Error occurred changing password');
	}
};
*/

exports.getUserProfile = function(req, res) {
	try {
		log.info('|user.getUserProfile|');
		res.send(JSON.stringify(req.session.userprofile));
	} catch (error) {
		log.error('|user.getUserProfile| Unknown -> ' + error, widget);
	}
};

