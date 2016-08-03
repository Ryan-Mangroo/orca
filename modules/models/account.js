// Config
var cfg = require('../config/config');

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
	_created_by: { type: Schema.Types.ObjectId, ref: 'User' },
    _updated_by: { type: Schema.Types.ObjectId, ref: 'User' }
}, cfg.mongoose.options);

var Acct = mongoose.model('Acct', acctSchema);

module.exports = Acct;