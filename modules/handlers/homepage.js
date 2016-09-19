var cfg = require('../../config/config');
var request = require('request')
var Homepage = require('../models/homepage');
var validator = require('../../utils/validator');
var utility = require('../../utils/utility');
var log = require('../../utils/logger');
var widget = 'homepage';
log.registerWidget(widget);

exports.getHomepage = function(req, res) {
	try {
		log.info('|homepage.getHomepage|', widget);

		var inboxID = req.query.inboxID;
		log.info('Getting homepage: ' + inboxID);

		Homepage.findOne({ _inbox: inboxID })
			.exec(
			function (error, homepage) {
				if (error) {
					log.error('|homepage.getHomepage| Unknown -> ' + error, widget);
					utility.errorResponseJSON(res, 'Unknown error getting homepage');
				} else if(!homepage) {
					log.error('|homepage.getHomepage| Homepage not found for inbox -> ' + inboxID, widget);
					utility.errorResponseJSON(res, 'Homepage not found');
				} else {


					log.info('Requesting classification');

					var classifyRequestOptions = {
						url: 'http://127.0.0.1:5000/classify',
						method: 'GET',
						qs: { token: '1234', keywords: 'TEST' },
					};

					request(classifyRequestOptions, function (error, response, predictions) {
						if (!error && response.statusCode == 200) {
							predictions = JSON.parse(predictions);
												
							var moodValue = 50;
							moodValue -= predictions['1']/2, 10;
							moodValue -= predictions['2']/4, 10;
							moodValue += predictions['4']/4, 10;
							moodValue += predictions['5']/2, 10;

							var keywordData = [];	
							for(var i=0; i<homepage.summaryKeywords.length; i++) {
								var singleKeyword = { title: homepage.summaryKeywords[i], value: moodValue };
								keywordData.push(singleKeyword);
							}
							log.info('Classification Success');
							return res.send(JSON.stringify({ result: { keywordData: keywordData, homepageID: homepage._id }}));

					  }
					})

				}
			});
	} catch (error) {
		log.error('|homepage.getHomepage| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Unknown error getting homepage');
	}
};


exports.updateKeywordSummary = function(req, res) {
	try {
		log.info('|homepage.updateKeywordSummary|', widget);
		// TODO: Scrub incoming 
		var homepageID = req.body.homepageID;
		log.info('|homepage.updateKeywordSummary| Updating homepage  -> ' + homepageID, widget);

		Homepage.findOne({ _id: homepageID })
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