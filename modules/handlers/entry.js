var log = {
	info: function(message) {
		console.log('INFO: ' + message);
	},
	error: function(message) {
		console.log('ERROR: ' + message);
	},
	object: function(object) {
		for(var key in object) {
			console.log('# OBJECT: ');
			console.log('# {"' + key + '": "' + object[key] + '"}');
			console.log('#');
		}
	},
};

exports.new = function(req, res) {
	try {
		log.info('|entry.new|');

		var newEntry = req.body.newEntry;
		log.object(newEntry);
		
		res.send(JSON.stringify({ result: newEntry }));
	} catch (error) {
		log.info('|entry.new|');
	}
};



exports.getAll = function(req, res) {
	try {
		log.info('|entry.getAll|');

		var entries = [
			{ _id: '1000', isNew: true, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] },
			{ _id: '1001', isNew: true, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] },
			{ _id: '1002', isNew: true, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] },
			{ _id: '1003', isNew: false, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] },
			{ _id: '1004', isNew: false, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] },
			{ _id: '1005', isNew: false, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] },
			{ _id: '1006', isNew: false, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] },
			{ _id: '1007', isNew: false, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] },
			{ _id: '1008', isNew: false, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [{ author: 'Jesse', note: 'We should talk about this' }] },
			{ _id: '1009', isNew: false, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] },
			{ _id: '1010', isNew: false, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] },
			{ _id: '1011', isNew: false, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] }
		];

		res.send(JSON.stringify({ result: entries }));
	} catch (error) {
		log.info('|entry.getAll|');
	}
};

exports.getOne = function(req, res) {
	try {
		log.info('|entry.getOne|');
		var entryNumber = req.query.entryNumber;

		log.info('Finding single entry: ' + entryNumber);

		var entries = {
			'1000': { _id: '1000', isNew: true, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] },
			'1001': { _id: '1001', isNew: true, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] },
			'1002': { _id: '1002', isNew: true, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] },
			'1003': { _id: '1003', isNew: false, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] },
			'1004': { _id: '1004', isNew: false, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] },
			'1005': { _id: '1005', isNew: false, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] },
			'1006': { _id: '1006', isNew: false, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] },
			'1007': { _id: '1007', isNew: false, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] },
			'1008': { _id: '1008', isNew: false, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [{ author: 'Jesse', note: 'We should talk about this' }] },
			'1009': { _id: '1009', isNew: false, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] },
			'1010': { _id: '1010', isNew: false, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] },
			'1011': { _id: '1011', isNew: false, created: 'August 29th 2016', message: 'Hello, i have some interesting feedback', notes: [] }
		};

		if(!entries[entryNumber]) {
			log.info('FAIL Match not found');
			res.send(JSON.stringify({ result: null }));
		} else {
			log.info('PASS Match found');
			res.send(JSON.stringify({ result: entries[entryNumber]}));
		}
	} catch (error) {
		log.info('|entry.getOne|');
	}
};


