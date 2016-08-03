// Config
var cfg = require('../config/config');

// TODO: Integrate with a unit testing framework
var log = require('../lib/logger.js');
var widget = 'mailertester';
log.registerWidget(widget);

var mailer = require('../lib/mailer');

// Mongoose
var mongoose = require('mongoose');

var utility = require('../lib/utility');

var NotificationTemplate = require('../lib/models/notificationTemplate');
var finished = false;

run();

function run() {
    var options = {
        server: { poolSize: cfg.mongo.poolSize, socketOptions: cfg.mongo.keepAlive }
    }

    mongoose.connect(cfg.mongo.uri, options);

    NotificationTemplate.findOne({name: 'Reset Password'})
                        .exec(function (error, notificationTemplate) {
                            if (error) {
                                log.error('Error occurred: ' + error, widget);
                                finished = true;
                            } else {
                                log.info("Found template!");
                                mailer.sendMail(notificationTemplate, {to: 'rmangroo@gmail.com'});
                            }
                        });
    testEnd();
}

function testEnd() {
    setTimeout(function() { 
                    if (finished) { 
                        process.exit();
                    } else {
                        testEnd();
                    }
                }, 2000);
}