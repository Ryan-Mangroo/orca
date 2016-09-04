var cfg = require('../../config/config');
var log = require('../../utils/logger');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var widget = 'counter';
log.registerWidget(widget);

var counterSchema = new Schema({
	seq: { type: Number, default: 100 },
 	collectionName: { type: String, required: true },
}, cfg.mongoose.options);

counterSchema.statics.increment = function(collectionName, callback) {
	try {
		this.findOneAndUpdate({collectionName: collectionName}, {$inc: { seq: 1} }, {new: true}, function(error, counter)	{
        	if(error)
            	return callback(error);
        	callback(null, counter.seq);
    	});

	} catch (error) {
		log.error('|Counter.increment| Unknown -> ' + error, widget);
		return callback(error, false);
	}
};

var Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;