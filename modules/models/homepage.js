var cfg = require('../../config/config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var homepageSchema = new Schema({
	summaryKeywords: { type: [String] },
	_inbox: { type: Schema.Types.ObjectId, ref: 'Inbox' }
}, cfg.mongoose.options);

var Homepage = mongoose.model('Homepage', homepageSchema);

module.exports = Homepage;