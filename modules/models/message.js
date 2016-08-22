// Config
var cfg = require('../../config/config');

// Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Counter = require('../models/counter');

var commentSchema = new Schema({
	comment: { type: String },
	_created_by: { type: Schema.Types.ObjectId, ref: 'User' }
}, cfg.mongoose.options);

var messageSchema = new Schema({
	mood: { type: Number },
	content: { type: String },
	comments: [commentSchema],
	_box: { type: Schema.Types.ObjectId, ref: 'Message' }
}, cfg.mongoose.options);

var Message = mongoose.model('Message', messageSchema);

module.exports = Message;


