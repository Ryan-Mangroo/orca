var cfg = require('../../config/config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var accountSchema = new Schema({
	name: { type: String, required: true, unique: true },
 	city: { type: String },
 	state: { type: String },
 	country: { type: String },
 	email: { type: String },
 	phone: { type: String },
 	logo: { type: String },
 	accountType: { type: String },
 	_primary_inbox: { type: Schema.Types.ObjectId, ref: 'Inbox' },
}, cfg.mongoose.options);

var Account = mongoose.model('Account', accountSchema);
module.exports = Account;