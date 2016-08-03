// TODO: Integrate with a unit testing framework
var log = require('../modules/logger.js');
var widget = 'cachetester';
log.registerWidget(widget);

var qpcache = require('../modules/cache');
var numTests = 6;
var executedTests = 0;

run();

function run() {
	var obj = {firstName: 'super', lastName: 'keiko'};
	testSave('testSave', obj);
	testGet('testGet', obj);
	testGetMultiple(['testDeleteMultiple1', 'testDeleteMultiple2', 'testDeleteMultiple3'], [obj,obj,obj]);
	testDelete('testDelete', obj);
	testDeleteMultiple(['testDeleteMultiple1', 'testDeleteMultiple2', 'testDeleteMultiple3'], [obj,obj,obj]);
	testTTL('testTTL', obj, 5);
	testEnd();
}

function testEnd() {
	setTimeout(function() { 
					if (numTests == executedTests) { 
						process.exit();
					} else {
						testEnd();
					}
				}, 2000);
}

function testSave(key, obj) {
	var passed = qpcache.save(key, obj);

	if (passed) {
		log.info('[[ qpcachetester.testSave ]] Saving object in cache PASSED');
	} else {
		log.info('[[ qpcachetester.testSave ]] Saving object in cache FAILED');		
	}

	executedTests++;
}

function testGet(key, obj) {
	qpcache.save(key, obj);
	var cachedObj = qpcache.get(key);

	var passed = true;

	if (!cachedObj) {
		log.info('[[ qpcachetester.testGet ]] Getting object in cache FAILED: Undefined object');	
		passed = false;
	}

	for (prop in cachedObj && passed) {
		if (cachedObj[prop] !== obj[prop]) {
			log.info('[[ qpcachetester.testGet ]] Getting object in cache FAILED: Missing property {' + prop + '}');	
			passed = false;	
		}
	}

	if (passed) {
		log.info('[[ qpcachetester.testGet ]] Getting object in cache PASSED');
	}

	executedTests++;
}

function testDelete(key, obj) {
	qpcache.save(key, obj);
	var passed = qpcache.delete(key);
	var cachedObj = qpcache.get(key);

	if (passed && !cachedObj) {
		log.info('[[ qpcachetester.testDelete ]] Deleting object in cache PASSED');
	} else {
		log.info('[[ qpcachetester.testDelete ]] Deleting object in cache FAILED');			
	}

	executedTests++;
}

function testDeleteMultiple(keys, objs) {
	for (var i = 0; i < keys.length; ++i) {
		qpcache.save(keys[i], objs[i]);
	}
	var remaining = keys.pop();
	var passed = qpcache.deleteMultiple(keys);

	for (var i = 0; i < keys.length; ++i) {
		if (qpcache.get(keys[i])) {
			passed = false;
			break;
		}
	}

	var cachedObj = qpcache.get(remaining);
	
	if (passed && cachedObj) {
		log.info('[[ qpcachetester.testDeleteMultiple ]] Deleting multiple objects in cache PASSED');
	} else {
		log.info('[[ qpcachetester.testDeleteMultiple ]] Deleting multiple objects in cache FAILED');			
	}

	executedTests++;
}

function testGetMultiple(keys, objs) {
	var map = {}
	for (var i = 0; i < keys.length; ++i) {
		qpcache.save(keys[i], objs[i]);
		map[keys[i]] = objs[i];
	}

	var remaining = keys.pop();
	var values = qpcache.getMultiple(keys);
	var passed = true;
	var numKeys = 0;

	if (!values) {
		log.info('[[ qpcachetester.testGetMultiple ]] Getting multiple objects in cache FAILED: Undefined values');	
		passed = false;
	} else {
		for (key in values) {
			numKeys++;
			for (valProp in values[key]) {
				if (values[key][valProp] !== map[key][valProp]) {
					log.info('[[ qpcachetester.testGetMultiple ]] Getting multiple objects in cache FAILED: Missing property {' + valProp + '}');	
					passed = false;	
				}
			}
		}
	}

	if (numKeys !== keys.length) {
		log.info('[[ qpcachetester.testGetMultiple ]] Getting multiple objects in cache FAILED: Mismatched values retrieved ' + numKeys + '!=' + keys.length);	
		passed = false;
	}
	
	if (passed) {
		log.info('[[ qpcachetester.testGetMultiple ]] Getting multiple objects in cache PASSED');
	}

	executedTests++;
}

function testTTL(key, obj, ttl) {
	qpcache.save(key, obj, ttl);

	setTimeout(function() {
		var cachedObj = qpcache.get(key);
		var passed = true;

		if (cachedObj) {
			log.info('[[ qpcachetester.testTTL ]] Testing time to live FAILED: Object Exists');	
			passed = false;
		}

		if (passed) {
			log.info('[[ qpcachetester.testTTL ]] Testing time to live PASSED');
		}
		executedTests++;

	}, ((ttl + 5) * 1000)); // Add 5 seconds to time to live to check if it is expired
}


