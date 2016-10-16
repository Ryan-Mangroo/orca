var log = {
	info: function(string) {
		console.log('INFO: ' + string);//
	},

	error: function(string) {
		console.log('ERROR: ' + string);
	},

	object: function(object){
		console.log('OBJECT: ')
		for(var property in object) {
			console.log('    { "' + property + '": "' + object[property] + '" }');
		}
	},
}

// Database & Storage
var mongoose = require('mongoose');
var aws = require('aws-sdk');

log.info('hello');
log.error('Error');