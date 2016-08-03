var widget = 'utility';
log.registerWidget(widget);

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