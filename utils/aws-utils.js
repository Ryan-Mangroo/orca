var aws = require('aws-sdk');
var log = require('./logger');
var widget = 'aws-utils';
log.registerWidget(widget);
//
exports.getSignedS3URL = function(fileName, fileType, bucketName, callback) {
	log.info('|aws-utils.getSignedS3URL|', widget);

	var s3 = new aws.S3();
	var s3Params = {
		Bucket: bucketName,
		Key: fileName,
		Expires: 60,
		ContentType: fileType,
		ACL: 'public-read'
	};

	s3.getSignedUrl('putObject', s3Params, function(error, data) {
		if(error){
		  log.error('|aws-utils.getSignedS3URL| Error genrating URL -> ' + error, widget);
		  callback(true, null);
		} else {
			log.info('|aws-utils.getSignedS3URL| Signed Request Success', widget);
			var fullRequest = {
			  signedRequest: data,
			  url: 'https://' + bucketName + '.s3.amazonaws.com/' + fileName
			};
			callback(null, fullRequest);
		}
	});
};