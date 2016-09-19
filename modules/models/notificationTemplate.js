var cfg = require('../../config/config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var notificationTemplateSchema = new Schema({
	name: {type: String, required: true },
	from: { type: String, required: true },
	replyTo: { type: String, required: true },
 	subject: { type: String, required: true },
 	html: { type: String, required: true },
 	priority: { type: String, default: 'normal' },
	_created_by: { type: Schema.Types.ObjectId, ref: 'User' },
    _updated_by: { type: Schema.Types.ObjectId, ref: 'User' }
}, cfg.mongoose.options);

notificationTemplateSchema.pre('save', function(next) {
	var currentDate = new Date();
	this.updated_at = currentDate;

	if (!this.created_at)
    	this.created_at = currentDate;

	next();
});


var NotificationTemplate = mongoose.model('Notification_Template', notificationTemplateSchema);

module.exports = NotificationTemplate;