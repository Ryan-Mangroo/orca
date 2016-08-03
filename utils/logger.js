var Stream = require('stream');
var stream = new Stream();
stream.writable = true
stream.write = function(obj) {
	if (obj.msg) {
		console.log("LOG: " + obj.msg)
	}

	if (obj.err) {
		console.log("ERROR: " + obj.err);
	}
}

var bunyan = require('bunyan');
var bunyanLog = bunyan.createLogger({
	name: 'orca',
	serializers: bunyan.stdSerializers,
	streams: [
		{
			type: "raw",
	        stream: stream
	    },
		/*{
			type: 'rotating-file',
        	path: './public/log/tx-prototype.log',
        	period: '1d',
        	count: 3
		}*/
	]
});

var defaultWidget = 'Logger'; // Default widget if none is passed in below
var childLogs = {Logger: bunyanLog.child({widget_type: 'Logger'})};

exports.registerWidget = function(widget) {
	childLogs[widget] = bunyanLog.child({widget_type: widget});
}

exports.info = function(obj, widget) {
	if (typeof widget === 'undefined') { widget = defaultWidget; }
	if (typeof obj === 'undefined') {
		return childLogs[widget].info();	
	} else {
		childLogs[widget].info(obj);
	}
}

exports.debug = function(obj, widget) {
	if (typeof widget === 'undefined') { widget = defaultWidget; }
	if (typeof obj === 'undefined') {
		return childLogs[widget].debug();	
	} else {
		childLogs[widget].debug(obj);
	}
}

exports.warn = function(obj, widget) {
	if (typeof widget === 'undefined') { widget = defaultWidget; }
	if (typeof obj === 'undefined') {
		return childLogs[widget].warn();	
	} else {
		childLogs[widget].warn(obj);
	}
}

exports.error = function(err, widget) {
	if (typeof widget === 'undefined') { widget = defaultWidget; }
	if (typeof err === 'undefined') {
		return childLogs[widget].error();	
	} else {
		childLogs[widget].error({err: err}); // Using {err: err} to make use of the err serializer
	}
}

exports.fatal = function(err, widget) {
	if (typeof widget === 'undefined') { widget = defaultWidget; }
	if (typeof err === 'undefined') {
		return childLogs[widget].fatal();	
	} else {
		childLogs[widget].fatal({err: err}); // Using {err: err} to make use of the err serializer
	}
}

exports.logObject = function(object) {
	this.info('## BEGIN LOGGING OF OBJECT ##');
	for (var property in object) {
		this.info('Key: ' + property);
		this.info('Val: ' + object[property]);
		this.info('');
	}
	this.info('## END LOGGING OF OBJECT ##');
}