// Config
var cfg = require('../../config/config');

// Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var homepageSchema = new Schema({
	summaryKeywords: { type: [String] },
	_account: { type: Schema.Types.ObjectId, ref: 'Account' }
}, cfg.mongoose.options);

var Homepage = mongoose.model('Homepage', homepageSchema);

module.exports = Homepage;