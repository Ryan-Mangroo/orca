// Config
var cfg = require('../config/config');

var utility = require('../utils/utility');
var validator = require('../utils/validator');
var request = require('request');
var j = request.jar();
var btoa = require('btoa');
var callStack = [];

run();

function next(error) {
	if (error) {
		process.exit();
	} else if (callStack.length > 0) {
		var nextCall = callStack.shift();
		nextCall();
	}
}

function run() {
	if (process.argv.length < 3) {
		console.log('Test Type required: node endPointTester.js [Test Type] [Test Arguments]');
		process.exit();
	} else {
		var testType = process.argv[2];

		switch (testType) {
			case 'all' : testAll(); break;
			case 'su' : testSignUp(); break;
			case 'auth' : testAuthentication(); break;
			case 'fp' : testForgotPassword(); break;
			case 'rp' : testResetPassword(); break;
			case 'ua' : testUpdateMyAccount(); break;
			case 'cp' : testChangePassword(); break;
			case 'up' : testUserProfile(); break;
			default : console.log('Invalid test type: ' + testType); process.exit();break;
		}
	}

}

function testAll() {
	if (process.argv.length < 5) {
		console.log('Email Address and Password required: node endPointTester.js all [emailAddress] [password]');
		process.exit();
	}

	var emailAddress = process.argv[3];
	var password = process.argv[4];

	callStack.push( function () { logIn(emailAddress, password) } );
	callStack.push( function () { getUserProfile(emailAddress); } );
	callStack.push( function () { updateMyAccount(emailAddress); } );
	callStack.push( function () { changePassword(emailAddress, password, '3ndP01n7!'); } );
	callStack.push( function () { logOut(emailAddress); } );	
	next();
}

function testAuthentication() {
	if (process.argv.length < 5) {
		console.log('Email Address and Password required: node endPointTester.js auth [emailAddress] [password]');
		process.exit();
	}

	var emailAddress = process.argv[3];
	var password = process.argv[4];

	callStack.push( function () { logIn(emailAddress, password) } );
	callStack.push( function () { logOut(emailAddress); } );	
	next();
}

function logIn(emailAddress, password) {
	console.log("Logging in with " + emailAddress + ":" + password);

	request({
		url: cfg.platform.url + "login",
		method: "POST",
		withCredentials: true,
		headers: {
			Authorization: 'Basic ' + btoa(emailAddress + ":" + password),
		},
		jar: j
	}, function(error, response, body) {
		console.log("Response to logIn: " + body);
		var cookie_string = j.getCookieString(cfg.platform.url + '/login'); 
		if (cookie_string) {
			console.log(cookie_string);
			console.log("");
			next();
		} else {
			next("Error");
		}
		
	});
}

function logOut(emailAddress) {
	console.log("Logging out " + emailAddress);

	request({
		url: cfg.platform.url + "logout",
		method: "GET",
		withCredentials: true,
		jar: j
	}, function(error, response, body) {
		//console.log("Response to logout: " + body);
		console.log("");
		process.exit();
	});
};

function testSignUp() {
	if (process.argv.length < 4) {
		console.log('Email Address required: node endPointTester.js su [emailAddress]');
		process.exit();
	}

	var emailAddress = process.argv[3];

	callStack.push( function () { signUp(emailAddress); } );
	callStack.push( function () { process.exit(); } );	
	next();
}

function signUp(emailAddress) {
	console.log("Signing up for " + emailAddress);

	var data = {};
	data.newEmailAddress = emailAddress;
	data.acctName = emailAddress + '_acct';
	data.firstName = 'John';
	data.lastName = 'Doe';
	data.newPassword = 'testpass';

	request({
		url: cfg.platform.url + "signup",
		method: "POST",
		json: true,
		body: data,
		withCredentials: true,
		jar: j
	}, function(error, response, body) {
		responseHandler(error, response, body);
	});
};

function testForgotPassword() {
	if (process.argv.length < 4) {
		console.log('Email Address required: node endPointTester.js fp [emailAddress]');
		process.exit();
	}

	var emailAddress = process.argv[3];

	callStack.push( function () { forgotPassword(emailAddress); } );
	callStack.push( function () { process.exit(); } );	
	next();
}

function forgotPassword(emailAddress) {
	console.log("Forgetting password for " + emailAddress);

	var data = {};
	data.emailAddress = emailAddress;

	request({
		url: cfg.platform.url + "forgotPwd",
		method: "POST",
		json: true,
		body: data,
		withCredentials: true,
		jar: j
	}, function(error, response, body) {
		responseHandler(error, response, body);
	});
};

function testResetPassword() {
	if (process.argv.length < 5) {
		console.log('New password and token required: node endPointTester.js rp [new password] [token]');
		process.exit();
	}

	var newPassword = process.argv[3];
	var token = process.argv[4];

	callStack.push( function () { resetPassword(newPassword, token); } );
	callStack.push( function () { process.exit(); } );	
	next();
}

function resetPassword(newPassword, token) {
	console.log("Resetting password with " + newPassword + ":" + token);

	var data = {};
	data.newPassword = newPassword;
	data.token = token;

	request({
		url: cfg.platform.url + "resetPwd",
		method: "POST",
		json: true,
		body: data,
		withCredentials: true,
		jar: j
	}, function(error, response, body) {
		responseHandler(error, response, body);
	});
};

function testUpdateMyAccount() {
	if (process.argv.length < 5) {
		console.log('Email Address and Password required: node endPointTester.js ua [emailAddress] [password]');
		process.exit();
	}

	var emailAddress = process.argv[3];
	var password = process.argv[4];

	callStack.push( function () { logIn(emailAddress, password) } );
	callStack.push( function () { updateMyAccount(emailAddress); } );
	callStack.push( function () { logOut(emailAddress); } );	
	next();
}

function updateMyAccount(emailAddress) {
	console.log("Update account for " + emailAddress);
	
	var data = {};
	data.user = {};
	data.user._id = '5621d1c8e4b0c03ff270e85e';
	data.user.firstName = 'endPoint';
	data.user.lastName = 'Tester';
	data.user.emailAddress = 'rmangroo@gmail.com';
	data.user.phone = '4407400123456';

	data.org = {};
	data.org.name = 'endPointTester Corp.';
	data.org.phone = '18005736729';

	request({
		url: cfg.platform.url + "updateMyAccount",
		method: "POST",
		json: true,
		body: data,
		withCredentials: true,
		jar: j
	}, function(error, response, body) {
		responseHandler(error, response, body);
	});
}

function testChangePassword() {
	if (process.argv.length < 6) {
		console.log('Email Address, Current Password, and New Password required: node endPointTester.js cp [emailAddress] [currentPassword] [newPassword]');
		process.exit();
	}

	var emailAddress = process.argv[3];
	var currentPassword = process.argv[4];
	var newPassword = process.argv[5];

	callStack.push( function () { logIn(emailAddress, currentPassword) } );
	callStack.push( function () { changePassword(emailAddress, currentPassword, newPassword); } );
	callStack.push( function () { logOut(emailAddress); } );	
	next();
}

function changePassword(emailAddress, currentPassword, newPassword) {
	console.log("Changing password for " + emailAddress);
	
	var data = {};
	data.user = {};
	data.user.currentPassword = currentPassword;
	data.user.newPassword = newPassword;

	request({
		url: cfg.platform.url + "changePassword",
		method: "POST",
		json: true,
		body: data,
		withCredentials: true,
		jar: j
	}, function(error, response, body) {
		responseHandler(error, response, body);
	});
}

function testUserProfile() {
	if (process.argv.length < 5) {
		console.log('Email Address and Password required: node endPointTester.js up [emailAddress] [Password]');
		process.exit();
	}

	var emailAddress = process.argv[3];
	var password = process.argv[4];

	callStack.push( function () { logIn(emailAddress, password) } );
	callStack.push( function () { getUserProfile(emailAddress); } );
	callStack.push( function () { logOut(emailAddress); } );	
	next();
}

function getUserProfile(emailAddress) {
	console.log("Getting profile for " + emailAddress);

	request({
		url: cfg.platform.url + "getUserProfile",
		method: "GET",
		json: true,
		withCredentials: true,
		jar: j
	}, function(error, response, body) {
		responseHandler(error, response, body);
	});
}

function responseHandler(error, response, body) {
	console.log("Response: " + body);
	console.log(JSON.stringify(body));
	console.log("");
	next();
}













