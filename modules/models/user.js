var cfg = require('../../config/config');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var log = require('../../utils/logger');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var widget = 'User';
log.registerWidget(widget);

var userSchema = new Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
 	firstName: { type: String, required: true },
 	lastName: { type: String, required: true},
	_account: { type: Schema.Types.ObjectId, ref: 'Account' },
	phone: String,
	state: String,
	role: String,
	passwordResetToken: String,
	passwordResetTokenExp: Date
}, cfg.mongoose.options);

userSchema.statics.authenticate = function(email, password, callback) {
	log.info('|User.authenticate|', widget);
	this.findOne({ 'email': email })
		.populate('_account')
		.exec( function (error, user) {
			if (error) { 
				return callback(error);
			}
			if (!user) { 
				log.error('|User.authenticate| User not found -> ' + email, widget);
				return callback(null, false);
			}
			bcrypt.compare(password, user.password, function(error, isMatch) {
				if (error) {
					log.error('|User.authenticate| Unknown -> ' + error, widget);
					return callback(error);
				}
				if (isMatch) {
					log.info('|User.authenticate| Credentials match for -> ' + email, widget);
					return callback(null, user);
				} else {
					log.error('|User.authenticate| Credentials do not match for -> ' + email, widget);
					return callback(null, false);
				}
			});
		}
	);
};


userSchema.statics.changePassword = function(accountID, userID, currentPassword, newPassword, callback) {
	log.info('|User.changePassword|', widget);

	this.findOne({ _id: userID, _account: accountID })
		.exec(
		function(err, user) {
			if (err) { return callback(err); }

			if (!user) { 
				log.error('|User.changePassword| User not found -> ' + userID, widget);
				return callback(null, false);
			}

			bcrypt.compare(currentPassword, user.password, function(err, isMatch) {
				if (err) {
					log.error(err, widget);
					return callback(err);
				}

				if (isMatch) {
					bcrypt.genSalt(10, function(err, salt) {
				    	bcrypt.hash(newPassword, salt, function(err, hash) {
				    		user.password = hash;
				    		user.resetPwdToken = '';
							user.resetPwd = false;
							user.resetPwdExpiration = '';
							user.save(function (err) {
								if (err) { return callback(err); }
					  			log.info('|User.changePassword| Password change successful', widget);
					  			return callback(null, user);
							});				
				    	});
					});
				} else {
					log.error('|User.authenticate| Error changing password, Credentials do not match -> ' + userID, widget);
					return callback(null, false);
				}
			});
		});
};


userSchema.statics.requestPasswordReset = function(emailAddress, callback) {
	log.info('|User.requestPasswordReset|', widget);
	this.findOne({ email: emailAddress }, function (error, user) {
		if (error) {
			log.error('|User.requestPasswordReset| Unknown -> ' + error, widget);
			return callback(error);
		}
			
		if (!user) { 
			log.error('|User.requestPasswordReset| User not found -> ' + emailAddress, widget);
			return callback(null, false);
		}

		var token = crypto.randomBytes(64).toString('hex');
		var now = new Date();
		now.setHours(now.getHours() + 1);

		user.passwordResetToken = token;
		user.passwordResetTokenExp = now.toString();

		user.save(function (error) {
			if (error) {
				log.error('|User.requestPasswordReset| Error saving password reset token -> ' + error, widget);
				return callback(error);
			} else {
				log.info('|User.requestPasswordReset| Password reset token generated -> ' + emailAddress, widget);
				return callback(null, user, token);
			}
		});
	});
};


userSchema.statics.resetPassword = function(token, newPassword, callback) {
	log.info('|User.resetPassword|', widget);
	this.findOne({ passwordResetToken: token })
		.exec(
		function (error, user) {
			if (error) {
				return callback(error);
			}
			
			if (!user) { 
				log.error('|User.resetPassword| Token not found -> ' + token, widget);
				return callback(null, false);
			}

			bcrypt.genSalt(10, function(error, salt) {
		    	bcrypt.hash(newPassword, salt, function(error, hash) {
		    		user.password = hash;
		    		user.passwordResetToken = '';
					user.passwordResetTokenExp = '';
					user.save(function (error) {
						if (error) {
							return callback(error);
						} else {
			  				log.info('|User.resetPassword| Password reset successful', widget);
			  				return callback(null, user);
						}
					});				
		    	});
			});
		}
	);
};

// Encrypt password when creating a new user
userSchema.pre('save', function(next) {
	var user = this;
	if (this.isNew) {
    	bcrypt.genSalt(10, function(err, salt) {
	    	bcrypt.hash(user.password, salt, function(err, hash) {
	    		user.password = hash;
				next();		
	    	});
		});
	} else {
		next();	
	}
});		


// Remove user data not needed by app
userSchema.post('save', function(user, next) {
	user.password = '';
    next();
});

var User = mongoose.model('User', userSchema);
module.exports = User;