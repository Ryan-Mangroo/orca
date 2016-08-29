// Config
var cfg = require('../../config/config');

// Misc Libs
var bcrypt = require('bcrypt');
var crypto = require('crypto');

// Logger
var log = require('../../utils/logger');
var widget = 'user';
log.registerWidget(widget);

// Mongoose
//var Counter = require('./counter');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
 	firstName: { type: String, required: true },
 	lastName: { type: String, required: true},
	_account: { type: Schema.Types.ObjectId, ref: 'Account' },
	phone: String,
	state: String,
	role: String
//	resetPwdToken: String,
//    resetPwd: Boolean,
//    resetPwdExpiration: Date,
//    verified: Boolean,
//    verifyToken: String,
//    newUser: Boolean,
}, cfg.mongoose.options);

userSchema.statics.authenticate = function(email, password, callback) {
	log.info('|User.authenticate|', widget);
	
	var accountPopulation = {
		path: '_account',
		model: 'Account',
		populate: {
			path: '_primary_box',
			model: 'Box'
		}
	};

	this.findOne({ 'email': email })
		.populate(accountPopulation)
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
					log.error(error, widget);
					return callback(error);
				}
				if (isMatch) {
					log.info('|User.authenticate| Credentials match for -> ' + email, widget);
					if (user.verified == false) {
						return callback('User is not verified');
					}
					return callback(null, user);
				} else {
					log.error('|User.authenticate| Credentials do not match for -> ' + email, widget);
					return callback(null, false);
				}
			});
		}
	);
};


userSchema.statics.changePassword = function(userID, currentPassword, newPassword, callback) {
	log.info('|User.changePassword|', widget);

	this.findById(userID)
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
					if (user.verified == false) {
						return callback('User not verified');
					}

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
					log.error('|User.authenticate| Credentials do not match for -> ' + userID, widget);
					return callback(null, false);
				}
			});
		});
};


/*
userSchema.statics.forgotPassword = function(emailAddress, callback) {
	log.info('|User.forgotPassword|', widget);
	this.findOne({emailAddress: emailAddress}, function (error, user) {
		if (error) {
			return callback(error);
		}
			
		if (!user) { 
			log.error('|User.forgotPassword| User not found -> ' + emailAddress, widget);
			return callback(null, false);
		}

		var token = crypto.randomBytes(64).toString('hex');
		var now = new Date();
		now.setHours(now.getHours() + 1);

		user.resetPwdToken = token;
		user.resetPwd = true;
		user.resetPwdExpiration = now.toString();

		user.save(function (error) {
			if (error) { return callback(error); }
				log.info('|User.forgotPassword| Request successfull -> ' + emailAddress, widget);
				return callback(null, user, token);
		});
	});
};
*/

/*
userSchema.statics.resetPassword = function(token, newPassword, callback) {
	log.info('|User.resetPassword|', widget);
	this.findOne({resetPwdToken: token})
		.exec(
		function (err, user) {
			if (err) { return callback(err); }
			
			if (!user) { 
				log.error('|User.resetPassword| Matching token not found -> ' + token, widget);
				return callback(null, false);
			}

			bcrypt.genSalt(10, function(err, salt) {
		    	bcrypt.hash(newPassword, salt, function(err, hash) {
		    		user.password = hash;
		    		user.resetPwdToken = '';
					user.resetPwd = false;
					user.resetPwdExpiration = '';
					user.save(function (err) {
						if (err) { return callback(err); }
			  			log.info('|User.resetPassword| Password reset successful', widget);
			  			return callback(null, user);
					});				
		    	});
			});
		});
};
*/

/*
userSchema.statics.verify = function(token, callback) {
	log.info('|User.verify|', widget);
	this.findOne({verifyToken: token})
		.exec(
		function (err, user) {
			if (err) { return callback(err); }
			
			if (!user) { 
				log.error('|User.verify| Matching token not found -> ' + token, widget);
				return callback(null, false);
			}
		    		
		    user.verified = true;
		    user.verifyToken = '';
		    		
			user.save(function (err) {
				if (err) { return callback(err); }
		  		log.info('|User.verify| Verify successful', widget);
		  		return callback(null, user);
			});						    
		});
};
*/

// Encrypt password when creating a new user
userSchema.pre('save', function(next) {
	var user = this;
	if (this.isNew) {
    	bcrypt.genSalt(10, function(err, salt) {
	    	bcrypt.hash(user.password, salt, function(err, hash) {
	    		user.password = hash;
	    		//user.resetPwdToken = '';
				//user.resetPwd = false;
				//user.resetPwdExpiration = '';
				//user.verified = false;
				//user.newUser = true;
				//user.verifyToken = crypto.randomBytes(64).toString('hex');
				next();		
	    	});
		});
	} else {
		next();	
	}
});		
/*
// Set counter when creating a new user
userSchema.pre('save', function(next) {
	var user = this;
	if (this.isNew) {
		Counter.increment('users', this._org, function(error, autonumber) {
			user.number = autonumber;
			next();
		});
	} else {
		next();
	}
});	
*/
// Remove user data not needed by app
userSchema.post('save', function(user, next) {
	user.password = '';
	//user.resetPwdToken = '';
	//user.verifyToken = '';
    next();
});

// Populate org reference
userSchema.post('save', function(user, next) {
	user.populate('_org', function(error, user) {
		if (error) { next(error); }
		next();
	});
});

var User = mongoose.model('User', userSchema);

module.exports = User;
