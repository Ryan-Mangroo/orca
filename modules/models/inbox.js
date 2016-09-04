var cfg = require('../../config/config');
var crypto = require('crypto');
var Counter = require('../models/counter');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var inboxSchema = new Schema({
	title: { type: String },
	number: { type: String },
	token: { type: String },
	image: { type: String },
	_account: { type: Schema.Types.ObjectId, ref: 'Account' }
}, cfg.mongoose.options);


inboxSchema.pre('save', function(next) {
	var inbox = this;
	if (this.isNew) {
		Counter.increment('boxes', function(error, autonumber) {
			inbox.number = autonumber;
			next();
		});
	} else {
		next();
	}
});


inboxSchema.pre('save', function(next) {
	var inbox = this;
	if (this.isNew) {
		inbox.token = crypto.randomBytes(12).toString('hex');
		next();
	} else {
		next();
	}
});


var Inbox = mongoose.model('Inbox', inboxSchema);

module.exports = Inbox;