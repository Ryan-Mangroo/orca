// Config
var cfg = require('../../config/config');

// Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var boxSchema = new Schema({
	title: { type: String },
	number: { type: String },
	token: { type: String },
	_acct: { type: Schema.Types.ObjectId, ref: 'Account' }
}, cfg.mongoose.options);

var Box = mongoose.model('Box', boxSchema);

module.exports = Box;