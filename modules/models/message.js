var cfg = require('../../config/config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Counter = require('../models/counter');
var log = require('../../utils/logger');
var widget = 'Message';
log.registerWidget(widget);


var commentSchema = new Schema({
	comment: { type: String },
	_created_by: { type: Schema.Types.ObjectId, ref: 'User' }
}, cfg.mongoose.options);

var messageSchema = new Schema({
	mood: { type: Number },
	content: { type: String },
	comments: [commentSchema],
	_account: { type: Schema.Types.ObjectId, ref: 'Account' },
	_inbox: { type: Schema.Types.ObjectId, ref: 'Inbox' }
}, cfg.mongoose.options);


// Better options scrubbing & account separation -------------------------------------------- TODO
messageSchema.statics.search = function(options, callback) {
	try {
		log.info('|Message.search|', widget);
		
		// First, build the result that we will be working with
		var result = {
			lastFieldValue: null,
			lastItemID: null,
			total: 0,
			messages: []
		}

		// Before we do the actual search to get the results,
		// we need to count the total number of messages.
		// No sorting or pagination is necessary at this point.
		var countQuery = {
			_account: options.accountID,
			_inbox: options.inboxID,
		};

		if (options.searchTerm) {
			countQuery['$text'] = { $search: options.searchTerm.toLowerCase() };
		}

		if (options.additionalQuery) {
			for (var property in options.additionalQuery) {
				if(options.additionalQuery[property] == 'null') {
					countQuery[property] = { '$exists' : false };
				} else {
					countQuery[property] = options.additionalQuery[property];
				}
			}
		}

		Message.count(countQuery, function(error, count){
			if (error) {
				log.error('|Message.search.count| Unknown -> ' + error, widget);
				return callback(error, null);
			} else if(count == 0)  {
				return callback(null, result);
			} else {
				result.total = count;

				// Define the sort criteria if given. If not, add a default "_id desc" criteria.
				var sortCriteria = {}
				if (options.sortField && options.sortOrder) {
					sortCriteria[options.sortField] = options.sortOrder;
					// Add "_id desc" as a second level sort, to handle sorting on non-unique values
					sortCriteria._id = 'desc';
				} else {
					// If no sort was given, default to just the _id.
					options.sortField = '_id';
					options.sortOrder = 'desc'; // assign values to the sort options so they can be passed to the anchor criteria
					sortCriteria[options.sortField] = options.sortOrder;
				}
				

				// Begin building the full search query.
				var searchQuery = {};
				searchQuery._inbox = options.inboxID;
				searchQuery._account = options.accountID;

				// Add the search term, if one was given
				if (options.searchTerm) {
					searchQuery['$text'] = { $search: options.searchTerm.toLowerCase() };
				}

				// Add the additional query criteria, if given
				if (options.additionalQuery) {
					for (var property in options.additionalQuery) {
						if(options.additionalQuery[property] == 'null') {
							searchQuery[property] = { '$exists' : false };
						} else {
							searchQuery[property] = options.additionalQuery[property];
						}
					}
				}

				// Add ther anchor query, if anchor criteria was given
				var anchorQuery = {};
				if (options.anchorFieldValue && options.anchorID) {
					anchorQuery = createMessageAnchorQuery(options.sortOrder, options.sortField, options.anchorFieldValue, options.anchorID);
				}

				var fullQuery = { $and: [searchQuery, anchorQuery] };

				// Lastly, grab the limit
				var messagesPerPage = options.messagesPerPage;

				Message.find(fullQuery)
					.sort(sortCriteria)
					.limit(messagesPerPage)
					.exec( function (error, messages) {
						if (error) {
							log.error('|Message.search.find| Unknown -> ' + error, widget);
							return callback(error, result);
						}

						if (!messages || messages.length == 0) { // Should have been handled in count
							log.info('|Message.search.find| No messages found', widget);
							return callback(null, result);
						}

						// Now that we have the messages, build the result set
						result.newAnchorValue = messages[messages.length-1][options.sortField];
						result.newAnchorID = messages[messages.length-1]._id;
						result.messages = messages;

						// Log and return the result
						log.info('|Message.search| Returning [' + messages.length + '] messages out of [' + result.total + ']', widget);
						return callback(null, result);
					}
				);
			}
		});
	} catch (error) {
		log.error('|Message.search| Unknown -> ' + error, widget);
		return callback(error, false);
	}
};


function createMessageAnchorQuery(sortOrder, sortField, anchorFieldValue, anchorID) {
	try {
		log.info('|Message.createMessageAnchorQuery|', widget);

		// The first part of the query is to add the simple 'Greater than' or
		// 'less than' criteria, which returns items before or after the last
		// one that was returned, depending on the sort order that was given.
		var greaterLessThanCriteria = {};
		if (sortOrder == 'asc') {
			greaterLessThanCriteria[sortField] = { $gt: anchorFieldValue };
		} else if (sortOrder == 'desc') {
			greaterLessThanCriteria[sortField] = { $lt: anchorFieldValue };
		}

		// The second part is a little trickier. We need to get those items
		// that have the same value as the last record but a greater ID.
		var equalToCriteria = {};
		equalToCriteria[sortField] = { $eq: anchorFieldValue };
		equalToCriteria._id = { $lt: anchorID };

		// Combine the two into an OR and return.
		var anchorQuery = { $or: [greaterLessThanCriteria, equalToCriteria] };
		return anchorQuery;

	} catch (error) {
		log.error('|Message.createMessageAnchorQuery| Unknown -> ' + error, widget);
	}
}

var Message = mongoose.model('Message', messageSchema);
module.exports = Message;