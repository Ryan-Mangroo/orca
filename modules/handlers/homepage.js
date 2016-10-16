var cfg = require('../../config/config');
var Homepage = require('../models/homepage');
var Message = require('../models/message');
var validator = require('../../utils/validator');
var utility = require('../../utils/utility');
var log = require('../../utils/logger');

var natural = require('natural');
var stopWordFilter = require('node-stopwords-filter');

var widget = 'homepage';
log.registerWidget(widget);

// Get the homepage for the given Inbox. Set the summary for all keywords to start at 0.
// The actual classification of the keywords will be done after the page is loaded.
exports.getHomepage = function(req, res) {
	try {
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

					// Get all messages from the inbox
					var options = {
						accountID: accountID,
						inboxID: inboxID,
						sortField: 'created_at',
						sortOrder: 'desc',
						anchorFieldValue: null,
						anchorID: null,
						searchTerm: null,
						messagesPerPage: 1,
						additionalQuery: null
					};

					Message.search(options, function(error, result){
						if (error) {
							log.info('|message.search| Unknown -> ' + error, widget);
						} else {

							// Two things need to happen:
							// 1. Training of the clasification model
							// 2. Storing of the results fo we can get the most frequent keywords
							var fullResults = [];
							var f = new stopWordFilter();
							var NGrams = natural.NGrams;

							for(var i=0; i<result.messages.length; i++) {
								var filteredContent = f.filter(result.messages[i].content, 'string');

								var gramedContent = NGrams.bigrams(filteredContent)
								for(var i=0; i<gramedContent.length; i++) {
									log.info(gramedContent);
								}
								fullResults += gramedContent;
							}

							log.info(fullResults);

							var keywords = [];
						    TfIdf = natural.TfIdf;
						    tfidf = new TfIdf();
						    var limit = 8;
						    var count = 0;
							tfidf.addDocument(fullResults);
							tfidf.listTerms(0).forEach(function(item) {
								if(count < limit) {
									keywords.push(item.term);
									count++
								}
							});

							var keywordData = [];	
							for(var i=0; i<keywords.length; i++) {
								var singleKeyword = { title: keywords[i].charAt(0).toUpperCase() + keywords[i].slice(1).toLowerCase(), value: 0 };
								keywordData.push(singleKeyword);
							}
							return res.send(JSON.stringify({ result: { keywordData: keywordData, homepageID: homepage._id }}));
						}
					});
				}
			});
	} catch (error) {
		log.error('|homepage.getHomepage| Unknown -> ' + error, widget);
		utility.errorResponseJSON(res, 'Unknown error getting homepage');
	}
};


exports.classifyKeyword = function(req, res) {
	try {
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
			messagesPerPage: 1,
			additionalQuery: null
		};
		Message.search(searchOptions, function(error, result){
			if (error) {
				log.error('|homepage.getHomepage| Error getting classification -> ' + keyword, widget);
				utility.errorResponseJSON(res, 'Error getting classification');
			} else {
				var moodValue = 50;
				var moodCounts = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, };
				var moodPercentages = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, };

				if(result.total == 0) {
					return res.send(JSON.stringify({ result: moodValue }));
				} else {
					var classifier = new natural.BayesClassifier();
					var f = new stopWordFilter();
					natural.PorterStemmer.attach();
					// Increment the counts of each of the moods in the result set
					for(var i=0; i<result.messages.length; i++) {
						var filteredContent = f.filter(result.messages[i].content, 'string');
						var stemmedContent = filteredContent.tokenizeAndStem();
						classifier.addDocument(stemmedContent, String(result.messages[i].mood));
						moodCounts[result.messages[i].mood] = moodCounts[result.messages[i].mood] + 1;
					}

					classifier.train();
					var stemmedKeyword = natural.PorterStemmer.stem(keyword);
					var keywordClassifications = classifier.getClassifications(stemmedKeyword);
					var scoreSum= 0;
					for(var i=0; i<keywordClassifications.length; i++) {
						scoreSum += (keywordClassifications[i].value * 100);
					}
					for(var i=0; i<keywordClassifications.length; i++) {
						var adjustedValue = ((keywordClassifications[i].value * 100) * 100) / scoreSum;
						moodPercentages[keywordClassifications[i].label] = adjustedValue;
					}

					/*
					// Now iterate through the counts to determine the percentage for each mood
					for(var count in moodCounts) {
						var value = moodCounts[count];
						var percentage = (value * 100) / result.total;
						moodPercentages[count] = percentage;
					}
					*/

					moodValue -= moodPercentages['1']/2, 10;
					moodValue -= moodPercentages['2']/4, 10;
					moodValue += moodPercentages['4']/4, 10;
					moodValue += moodPercentages['5']/2, 10;

					if(moodValue <= 0) {
						moodValue = 5;
					}

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