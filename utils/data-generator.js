var request = require('request');
var j = request.jar();
var btoa = require('btoa');

var log = require('./logger');
var widget = 'data-generator';
log.registerWidget(widget);

var numParts = 15;
var numInstructions = 0;
var numWorkOrders = 0;

var numItems = numParts + numInstructions + numWorkOrders;
var itemsCreated = 0;

var newPart = {};
newPart.name = 'Data Generated Part';
newPart.description = 'This part was created from the QP Data Generator';
newPart.category = 'Tube';

var newWorkOrder = {};
newWorkOrder.title = 'Data Generated Work Order';
newWorkOrder.description = 'This work order was created from the QP Data Generator';
newWorkOrder.parts = [];
newWorkOrder._instruction = "56aad66f06e9760300f0a0b3";

var newInstruction = {};
newInstruction.name = 'Data Generated Instruction';
newInstruction.description = 'This instruction was created from the QP Data Generator';


run();

function end() {
	setTimeout(function() { 
		if (numItems == itemsCreated) { 
			logOut();
		} else {
			end();
		}
	}, 2000);
}

function run() {
	logIn();
	end();
}

function logIn() {
	request({
		url: "http://auth.quikpaper.com/login",
		method: "POST",
		withCredentials: true,
		headers: {
			Authorization: 'Basic ' + btoa('ryan:testpass'),
		},
		jar: j
	}, function(error, response, body) {
		console.log("Response to logIn: " + body);
		var cookie_string = j.getCookieString('http://auth.quikpaper.com/login'); 
		console.log(cookie_string);
		getCollections();
		
	});
}

function getCollections() {
	request({
		url: "http://app.quikpaper.com/getCollections",
		method: "GET",
		withCredentials: true,
		jar: j
	}, function(error, response, body) {
		console.log("Response to get collections: " + body);
		generateData();
	});	
}

function logOut() {
	request({
		url: "http://app.quikpaper.com/logout",
		method: "GET",
		withCredentials: true,
		jar: j
	}, function(error, response, body) {
		console.log("Response to logout: " + body);
		process.exit();
	});
}

function generateData() {
	createItems('parts', newPart, numParts);
	createItems('instructions', newInstruction, numInstructions);
	createItems('workorders', newWorkOrder, numWorkOrders);	
}

function createItems(collectionName, newItem, howMany) {
	for (var i = 0 ; i < howMany; ++i) {
		var data = {};
		data.collectionName = collectionName;
		data.newItem = newItem;

		request({
			url: "http://app.quikpaper.com/createNewItem",
			method: "POST",
			json: true,
			body: data,
			withCredentials: true,
			jar: j
		}, function(error, response, body) {
			if (error) {
				console.log("Error Occurred: " + error);
			} else {
				console.log("Created new Item " + body.item.number + ' -> total items created: ' + itemsCreated);				
			}
			itemsCreated++;
		});
	}
}






