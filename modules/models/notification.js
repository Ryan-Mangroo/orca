// Config

var cfg = require('../../config/config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var notificationSchema = new Schema({
	to: { type: [String], required: true },
	from: { type: String, required: true },
	replyTo: { type: String, required: true },
 	cc: { type: [String] },
 	bcc: { type: [String] },
 	subject: { type: String, required: true },
 	html: { type: String, required: true },
 	priority: { type: String },
 	attachments: { type: [Schema.Types.ObjectId], ref: 'Attachment' },
 	notificationType: { type: String, default: 'email'},
 	status: { type: String, default: 'pending' },
 	notificationTemplate: { type: Schema.Types.ObjectId, ref: 'NotificationTemplate' },
	_created_by: { type: Schema.Types.ObjectId, ref: 'User' },
    _updated_by: { type: Schema.Types.ObjectId, ref: 'User' }
}, cfg.mongoose.options);

notificationSchema.statics.createNew = function(mailOptions, notificationTemplateId, sent, creator, callback) {
	try {
		var newNotification = new Notification();

		for (var prop in mailOptions) {
			newNotification[prop] = mailOptions[prop];
		}

		newNotification.notificationTemplate = notificationTemplateId;

		newNotification._created_by = creator;
		newNotification._updated_by = creator;		

		if (sent) { newNotification.status = 'sent'; } 
		else { newNotification.status = 'failed'; }

		newNotification.save(function (error, notification) {
			if (error) {
				callback(error);
			} else {
				callback(null, notification);
			}
		});

	} catch (error) {
		log.error('| Notification.createNew | -> ' + error, widget);
		return callback(error, false);
	}

};

notificationSchema.pre('save', function(next) {
	var currentDate = new Date();
	this.updated_at = currentDate;

	if (!this.created_at)
    	this.created_at = currentDate;

	next();
});


var Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
