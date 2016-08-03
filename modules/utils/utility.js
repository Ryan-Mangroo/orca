var log = require('./logger.js');
var widget = 'utility';
log.registerWidget(widget);

/*
 * Log all property names and values for the given object. 
 */
exports.logObject = function(object) {
	log.info('## BEGIN LOGGING OF OBJECT ##');
	for (var property in object) {
		log.info('Key: ' + property, widget);
		log.info('Val: ' + object[property], widget);
		log.info('', widget);
	}
	log.info('## END LOGGING OF OBJECT ##');
}

/*
 * Log an easy to read indication of server start
 */ 
exports.logServerStart = function() {
	console.log('##\n###################################');
	console.log('##     App started and ready     ##');
	console.log('###################################\n##');
}

/*
 * Generate an "error = true" error response with the given message
 */
exports.errorResponseJSON = function(/* Obj */ response, /* String */ message) {
	var info = {
		error: true,
		message: message
	}
	response.send(JSON.stringify(info));
};