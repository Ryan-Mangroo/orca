// Config
var cfg = require('../../config/config');

var crypto = require('crypto');

// Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var boxSchema = new Schema({
	title: { type: String },
	number: { type: String },
	token: { type: String },
	_acct: { type: Schema.Types.ObjectId, ref: 'Account' }
}, cfg.mongoose.options);

boxSchema.pre('save', function(next) {
	var box = this;
	if (this.isNew) {
		Counter.increment('boxes', function(error, autonumber) {
			box.number = autonumber;
			next();
		});
	} else {
		next();
	}
});

boxSchema.pre('save', function(next) {
	var box = this;
	if (this.isNew) {
		box.token = crypto.randomBytes(64).toString('hex');
	} else {
		next();
	}
});

var Box = mongoose.model('Box', boxSchema);

module.exports = Box;