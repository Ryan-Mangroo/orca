// Config
var cfg = require('../../config/config');

// Mongoose
var Homepage = require('../models/homepage');

// Custom modules
var validator = require('../../utils/validator');
var utility = require('../../utils/utility');
var log = require('../../utils/logger');
var widget = 'homepage';
log.registerWidget(widget);

exports.getKeywords = function(req, res) {
	try {
		log.info('|homepage.getHomeKeywords|', widget);

		var accountID = req.session.userprofile.account._id;
		
		Homepage.findOne({ _account: accountID })
			.exec(
			function (error, homepage) {
				if (error) {
					log.error('|homepage.getHomeKeywords| Unknown -> ' + error, widget);
					utility.errorResponseJSON(res, 'Unknown error getting homepage keywords');
				} else {
					log.info('Homepage found: ' + homepage._id, widget);
					log.info('Getting keyword predictions', widget);

					var keywordData = [];
					for(var i=0; i<homepage.keywords.length; i++) {
						var moodValue = getMoodValue(homepage.keywords[i]);
						var singleKeyword = { title: homepage.keywords[i], value: moodValue };
						keywordData.push(singleKeyword);
					}


					res.send(JSON.stringify({ result: keywordData }));
				}
			});
	} catch (error) {
		log.error('|homepage.getHomeKeywords| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Unknown error getting homepage keywords');
	}
};


function getMoodValue(inputString) {
	var predictions = predict(inputString);
	var moodValue = 50;
	moodValue -= predictions['1']/2, 10;
	moodValue -= predictions['2']/4, 10;
	moodValue += predictions['3']/4, 10;
	moodValue += predictions['4']/2, 10;
	return moodValue;
}


function predict(inputString) {

	var startingNumber = Math.floor((Math.random() * 100) + 1);
	var randomPercentages = [];
	randomPercentages.push(startingNumber);

	var differenceRemaining = 100 - startingNumber;
	var distValue = differenceRemaining / 3;

	randomPercentages.push(parseInt(distValue));
	randomPercentages.push(parseInt(distValue));
	randomPercentages.push(parseInt(distValue));

	var sum = randomPercentages[0]+randomPercentages[1]+randomPercentages[2]+randomPercentages[3];
	if(sum < 100) {
		randomPercentages[0] = randomPercentages[0] + (100 - sum);
	}


	var result = {
		'1': randomPercentages[0],
		'2': randomPercentages[1],
		'3': 0,
		'4': randomPercentages[2],
		'5': randomPercentages[3]
	};
	return result;
}




