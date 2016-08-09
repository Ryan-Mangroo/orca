// Config
var cfg = require('../../config/config');

// Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Counter = require('../models/counter');

var messageSchema = new Schema({
	mood: { type: Number },
	content: { type: String },
	_box: { type: Schema.Types.ObjectId, ref: 'Message' }
}, cfg.mongoose.options);

var Message = mongoose.model('Message', messageSchema);

module.exports = Message;


