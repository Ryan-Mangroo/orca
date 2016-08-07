var log = {
	info: function(message) {
		console.log('INFO: ' + message);
	},
	error: function(message) {
		console.log('ERROR: ' + message);
	},
	object: function(object) {
		console.log('#');
		console.log('##### OBJECT: ');
		for(var key in object) {
			console.log('# {"' + key + '": "' + object[key] + '"}');
		}
		console.log('# END OBJECT');
	},
};