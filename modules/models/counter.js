// Config
var cfg = require('../../config/config');

// Logger
var log = require('../../utils/logger');
var widget = 'counter';
log.registerWidget(widget);

//Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var counterSchema = new Schema({
	seq: { type: Number, default: 100 },
 	prefix: { type: String },
 	collectionName: { type: String, required: true },
}, cfg.mongoose.options);

counterSchema.virtual('autonumber').get(function () {
	return this.prefix + this.seq;
});

counterSchema.statics.increment = function(collectionName, callback) {
	try {
		this.findOneAndUpdate({collectionName: collectionName}, {$inc: { seq: 1} }, {new: true}, function(error, counter)	{
        	if(error)
            	return callback(error);
        	callback(null, counter.autonumber);
    	});

	} catch (error) {
		log.error('|Counter.increment| Unknown -> ' + error, widget);
		return callback(error, false);
	}
};

var Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;