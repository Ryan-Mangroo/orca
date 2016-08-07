// Config
var cfg = require('../../config/config');

// Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var accountSchema = new Schema({
	name: { type: String, required: true, unique: true },
 	city: { type: String },
 	state: { type: String },
 	country: { type: String },
 	email: { type: String },
 	phone: { type: String },
 	accountType: { type: String },
 	_primary_box: { type: Schema.Types.ObjectId, ref: 'Box' },
}, cfg.mongoose.options);

var Account = mongoose.model('Account', accountSchema);

module.exports = Account;