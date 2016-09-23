var cfg = require('../../config/config');
var Homepage = require('../models/homepage');
var Message = require('../models/message');
var validator = require('../../utils/validator');
var utility = require('../../utils/utility');
var log = require('../../utils/logger');
var widget = 'homepage';
log.registerWidget(widget);

// Get the homepage for the given Inbox. Set the summary for all keywords to start at 0.
// The actual classification of the keywords will be done after the page is loaded.
exports.getHomepage = function(req, res) {
	try {
		log.info('|homepage.getHomepage|', widget);
		var inboxID = req.query.inboxID;
		var accountID = req.session.userprofile.account._id;

		Homepage.findOne({ _inbox: inboxID, _account: accountID })
			.exec(
			function (error, homepage) {
				if (error) {
					log.error('|homepage.getHomepage| Unknown -> ' + error, widget);
					utility.errorResponseJSON(res, 'Unknown error getting homepage');
				} else if(!homepage) {
					log.error('|homepage.getHomepage| Homepage not found for inbox -> ' + inboxID, widget);
					utility.errorResponseJSON(res, 'Homepage not found');
				} else {

					var keywordData = [];	
					for(var i=0; i<homepage.summaryKeywords.length; i++) {
						var singleKeyword = { title: homepage.summaryKeywords[i], value: 0 };
						keywordData.push(singleKeyword);
					}
					return res.send(JSON.stringify({ result: { keywordData: keywordData, homepageID: homepage._id }}));
				}
			});
	} catch (error) {
		log.error('|homepage.getHomepage| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Unknown error getting homepage');
	}
};


exports.classifyKeyword = function(req, res) {
	try {
		log.info('|homepage.classifyKeyword|', widget);
		var inboxID = req.query.inboxID;
		var keyword = req.query.keyword;
		var accountID = req.session.userprofile.account._id;

		var searchOptions = {
			accountID: accountID,
			inboxID: inboxID,
			sortField: 'created_at',
			sortOrder: 'desc',
			anchorFieldValue: null,
			anchorID: null,
			searchTerm: keyword,
			messagesPerPage: 10000,
			additionalQuery: null
		};
		Message.search(searchOptions, function(error, result){
			if (error) {
				log.error('|homepage.getHomepage| Error getting classification -> ' + keyword, widget);
				utility.errorResponseJSON(res, 'Error getting classification');
			} else {
				log.info('Messages found: ' + result.total);

				var moodValue = 50;
				var moodCounts = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, };
				var moodPercentages = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, };

				if(result.total == 0) {
					return res.send(JSON.stringify({ result: moodValue }));
				} else {
					
					// Increment the counts of each of the moods in the result set
					for(var i=0; i<result.messages.length; i++) {
						moodCounts[result.messages[i].mood] = moodCounts[result.messages[i].mood] + 1;
					}

					// Now iterate through the counts to determine the percentage for each mood
					for(var count in moodCounts) {
						var value = moodCounts[count];
						var percentage = (value * 100) / result.total;
						moodPercentages[count] = percentage;
					}

					moodValue -= moodPercentages['1']/2, 10;
					moodValue -= moodPercentages['2']/4, 10;
					moodValue += moodPercentages['4']/4, 10;
					moodValue += moodPercentages['5']/2, 10;

					return res.send(JSON.stringify({ result: moodValue }));
				}
			}
		});

	} catch (error) {
		log.error('|homepage.classifyKeyword| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Unknown error getting homepage');
	}
};


exports.saveKeyword = function(req, res) {
	try {
		log.info('|homepage.saveKeyword|', widget);
		// TODO: Scrub incoming 
		var homepageID = req.body.homepageID;
		var keyword = req.body.keyword;
		var accountID = req.session.userprofile.account._id;
		log.info('|homepage.saveKeyword| Updating keyword on homepage  -> ' + homepageID, widget);

		Homepage.findOne({ _id: homepageID, _account: accountID })
    		.exec(
    		function(error, homepage) {
	    		if (error) {
					log.error('|homepage.saveKeyword.findById| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error occurred saving keyword');
				} else if(!homepage) {
					log.error('|homepage.saveKeyword.findById| Homepage not found -> ' + error, widget);
					utility.errorResponseJSON(res, 'Homepage not found');
				} else {			
					homepage.summaryKeywords.push(keyword);
			    	homepage.save(function(error){
						if (error) {
							log.error('|homepage.saveKeyword.save| Unknown  -> ' + error, widget);
							utility.errorResponseJSON(res, 'Error occurred saving keyword');
						} else {
							res.send(JSON.stringify({ result: true }));
						}
			    	});
				}
	    	});
	} catch (error) {
		log.error('|homepage.saveKeyword| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error occurred saving keyword');
	}
};

exports.removeKeyword = function(req, res) {
	try {
		log.info('|homepage.removeKeyword|', widget);
		// TODO: Scrub incoming 
		var homepageID = req.body.homepageID;
		var keywordIndex = req.body.keywordIndex;
		var accountID = req.session.userprofile.account._id;
		log.info('|homepage.removeKeyword| Removing keyword on homepage  -> ' + homepageID, widget);

		Homepage.findOne({ _id: homepageID, _account: accountID })
    		.exec(
    		function(error, homepage) {
	    		if (error) {
					log.error('|homepage.removeKeyword.findById| Unknown  -> ' + error, widget);
					utility.errorResponseJSON(res, 'Error occurred removing keyword');
				} else if(!homepage) {
					log.error('|homepage.removeKeyword.findById| Homepage not found -> ' + error, widget);
					utility.errorResponseJSON(res, 'Homepage not found');
				} else {
					homepage.summaryKeywords.splice(keywordIndex, 1);
			    	homepage.save(function(error){
						if (error) {
							log.error('|homepage.removeKeyword.save| Unknown  -> ' + error, widget);
							utility.errorResponseJSON(res, 'Error occurred removing keyword');
						} else {
							res.send(JSON.stringify({ result: true }));
						}
			    	});
				}
	    	});
	} catch (error) {
		log.error('|homepage.removeKeyword| Unknown -> ' + error, widget);
	    utility.errorResponseJSON(res, 'Error occurred removing keyword');
	}
};