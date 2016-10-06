var log = {
	info: function(message) {
		console.log('INFO: ' + message);
	},
	error: function(message) {
		console.log('ERROR: ' + message);
	},
	object: function(object) {
		console.log('##### OBJECT: ');
		for(var key in object) {
			console.log('    {"' + key + '": "' + object[key] + '"}');
		}
		console.log('##### END OBJECT');
	},
};

// Makes navbars collapse when links are clicked
$(document).on('click','.navbar-collapse.in',function(e) {
    if( $(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle' ) {
        $(this).collapse('hide');
    }
});

$(document).click(function(e) {
    if (e.target.id == 'mainLink' || !$(e.target).is('a')) {
        $('.collapse').collapse('hide');        
    }
});