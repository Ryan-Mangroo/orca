// Config
var cfg = require('../../config/config');

// Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var acctSchema = new Schema({
	name: { type: String, required: true, unique: true },
	streetAddress: { type: String },
 	city: { type: String },
 	state: { type: String },
 	country: { type: String },
 	zip: { type: String },
 	emailAddress: { type: String },
 	phone: { type: String },
 	accountType: { type: String },
}, cfg.mongoose.options);

var Acct = mongoose.model('Account', acctSchema);

module.exports = Acct;