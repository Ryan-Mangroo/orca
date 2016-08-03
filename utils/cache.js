// Config
var cfg = require('../config/config');

// Node Cache
var NodeCache = require('node-cache');

// Custom Modules
var log = require('./logger.js');
var widget = 'cache';
log.registerWidget(widget);

exports.longTTL = cfg.cache.longTTL;
exports.mediumTTL = cfg.cache.mediumTTL;
exports.shortTTL = cfg.cache.shortTTL;

var cache = new NodeCache( { stdTTL: this.longTTL, checkperiod: cfg.cache.checkPeriod } );

cache.on('set', function(key, value){
    // ... do something ...   
});

cache.on('del', function(key, value){
    // ... do something ...   
});

cache.on('flush', function(){
    // ... do something ...   
});

cache.on('expired', function(key, value){
    log.info('|cache.expired| -> ' + key + ':' + value ); 
});

exports.save = function (key, val, ttl) {
	try {
		log.info('|cache.save| Attempting cache', widget);
		if (!ttl) {
			return cache.set(key, val); 
		} else {
			return cache.set(key, val, ttl);
		}
	} catch (error) {
		log.error('|cache.save| Unknown -> ' + error, widget);
	}

	return false;
};

exports.get = function (key) {
	try {
		return cache.get(key);
	} catch (error) {
		log.error('|cache.get| Unknown -> ' + error, widget);
	}

	return null;
};


exports.getMultiple = function (keys) {
	try {
		return cache.mget(keys);
	} catch (error) {
		log.error('|cache.getMultiple| Unknown -> ' + error, widget);
	}

	return null;
};

exports.delete = function (key) {
	try {
		cache.del(key);
		return true;
	} catch (error) {
		log.error('|cache.delete| Unknown -> ' + error, widget);
	}

	return false;
};

exports.deleteMultiple = function (keys) {
	try {
		cache.del(keys);
		return true;
	} catch (error) {
		log.error('|cache.deleteMultiple| Unknown -> ' + error, widget);
	}

	return false;
};

exports.getKeys = function () {
	try {
		return cache.keys();
	} catch (error) {
		log.error('|cache.getKeys| Unknown -> ' + error, widget);
	}

	return null;
};

exports.getStatus = function () {
	try {
		return cache.getStats();
	} catch (error) {
		log.error('|cache.getStatus| Unknown -> ' + error, widget);
	}

	return null;
};


exports.flush = function () {
	try {
		cache.flushAll();
		return this.getKeys().length === 0;
	} catch (error) {
		log.error('|cache.flush| Unknown -> ' + error, widget);
	}

	return false;
};


