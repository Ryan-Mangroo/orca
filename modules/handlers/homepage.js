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

exports.getKeywordSummary = function(req, res) {
	try {
		log.info('|homepage.getKeywordSummary|', widget);
		var accountID = req.session.userprofile.account._id;		
		Homepage.findOne({ _account: accountID })
			.exec(
			function (error, homepage) {
				if (error) {
					log.error('|homepage.getKeywordSummary| Unknown -> ' + error, widget);
					utility.errorResponseJSON(res, 'Unknown error getting summary keywords');
				} else {
					var keywordData = [];
					for(var i=0; i<homepage.summaryKeywords.length; i++) {
						var moodValue = getMoodValue(homepage.summaryKeywords[i]);
						var singleKeyword = { title: homepage.summaryKeywords[i], value: moodValue };
						keywordData.push(singleKeyword);
					}
					res.send(JSON.stringify({ result: { keywordData: keywordData, homepageID: homepage._id }}));
				}
			});
	} catch (error) {
		log.error('|homepage.getKeywordSummary| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Unknown error getting summary keywords');
	}
};


exports.updateKeywordSummary = function(req, res) {
	try {
		log.info('|homepage.updateKeywordSummary|', widget);
		// TODO: Scrub incoming 
		var accountID = req.session.userprofile.account._id;
		var homepageID = req.body.homepageID;
		log.info('|homepage.updateKeywordSummary| Updating homepage  -> ' + accountID, widget);

		Homepage.findOne({ _account: accountID, _id: homepageID })
    		.exec(
    		function(error, homepage) {
	    		if (error) {
					log.error('|homepage.updateKeywordSummary.findById| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error occurred updating homepage');
				} else if(!homepage) {
					log.error('|homepage.updateKeywordSummary.findById| Homepage not found -> ' + error, widget);
					utility.errorResponseJSON(res, 'Homepage not found');
				} else {			
					homepage.summaryKeywords = req.body.keywordList;
			    	homepage.save(function(error){
						if (error) {
							log.error('|homepage.updateKeywordSummary.save| Unknown  -> ' + error, widget);
							utility.errorResponseJSON(res, 'Error occurred updating');
						} else {
							res.send(JSON.stringify({ result: true }));
						}
			    	});
				}
	    	});
	} catch (error) {
		log.error('|homepage.updateKeywordSummary| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error while updating homepage');
	}
};


function getMoodValue(inputString) {
	var predictions = predict(inputString);
	var moodValue = 50;
	moodValue -= predictions['1']/2, 10;
	moodValue -= predictions['2']/4, 10;
	moodValue += predictions['4']/4, 10;
	moodValue += predictions['5']/2, 10;
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




