// Config
var cfg = require('../config/config');

var NodeMailer = require('nodemailer'); // http://nodemailer.com/

// Custom modules
var Notification = require('./models/notification');
var log = require('./logger');

var widget = 'mailer';
log.registerWidget(widget);

// This transporter will work with our gmail account, however, in the future 
// we will probably need our own mail server, in which case we can still use
// nodemailer, just need to create a different transporter
var transporter = NodeMailer.createTransport({
    service: 'Gmail',
    auth: {
        user: cfg.mailer.user,
        pass: cfg.mailer.pass
    }
});


var mailProps = ['to', 'cc', 'bcc', 'subject', 'html', 'priority', 'attachments', 'from', 'replyTo'];
/*
recipients = 
{ to: 'rmangroo@gmail.com, jessewilly@gmail.com', cc: 'rmangroo@gmail.com', bcc: 'jessewilly@gmail.com' }
*/
exports.sendMail = function (notificationTemplate, recipients, creator) {
    // First build the mail options for sending mail through node mailer
    var mailOptions = buildMailOptions(notificationTemplate, recipients);

    // Send the mail out
    transporter.sendMail(mailOptions, function(error, info){
        var sent = true;
        if(error){
            sent = false;
            log.logObject(error);
        } else {
           log.info('Message sent: ' + info.response); 
        }
        
        Notification.createNew(mailOptions, notificationTemplate._id, sent, creator, function(error, notification) {
            if (error) { 
                log.error('Error in sendMail: ' + error);
            }

            log.info('Notification Saved Successfully');
        });
    });
};

function buildMailOptions(notificationTemplate, recipients) {
    var mailOptions = {};
    for (var i = 0 ; i < mailProps.length; i++) {
        var prop = mailProps[i];
        if (notificationTemplate[prop]) {
            mailOptions[prop] = notificationTemplate[prop];
        } else {
            mailOptions[prop] = recipients[prop];
        }
    }

    return mailOptions;
}

/*
mailOptions is an object with the following properties:

var mailOptions = {
        to: 'rmangroo@gmail.com, jessewilly@gmail.com',
        cc: 'rmangroo@gmail.com',
        bcc: 'jessewilly@gmail.com',
        subject: 'QuikPaper has email now!',
        html: '<b>Basic email integration is now <font color="green" size=5>working!</font> The from address is also a Google Account I created for QuikPaper (quikpaper.mailer@gmail.com).</b>',
        priority: 'high', // (high, normal, low)
        attachments: (array of attachment objects)
    }

attachments: [
        {   // utf-8 string as an attachment
            filename: 'text1.txt',
            content: 'hello world!'
        },
        {   // binary buffer as an attachment
            filename: 'text2.txt',
            content: new Buffer('hello world!','utf-8')
        },
        {   // file on disk as an attachment
            filename: 'text3.txt',
            path: '/path/to/file.txt' // stream this file
        },
        {   // filename and content type is derived from path
            path: '/path/to/file.txt'
        },
        {   // stream as an attachment
            filename: 'text4.txt',
            content: fs.createReadStream('file.txt')
        },
        {   // define custom content type for the attachment
            filename: 'text.bin',
            content: 'hello world!',
            contentType: 'text/plain'
        },
        {   // use URL as an attachment
            filename: 'license.txt',
            path: 'https://raw.github.com/andris9/Nodemailer/master/LICENSE'
        },
        {   // encoded string as an attachment
            filename: 'text1.txt',
            content: 'aGVsbG8gd29ybGQh',
            encoding: 'base64'
        },
        {   // data uri as an attachment
            path: 'data:text/plain;base64,aGVsbG8gd29ybGQ='
        }
    ]

The from and replyTo address is not required, it is added within the sendMail method.
*/



