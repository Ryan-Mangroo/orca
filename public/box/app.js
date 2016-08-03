var App = angular.module('App', ['ngRoute', 'ngAnimate']);

// Controllers
App.controller('mainController', mainController);

// Factories
App.factory('Entry', Entry);

App.config(function($routeProvider) {
	$routeProvider.when('/', { templateUrl : 'views/newentry.html', controller: entryController});
	$routeProvider.when('/view', { templateUrl : 'views/newentry.html', controller: entryController});
	$routeProvider.when('/submitted', { templateUrl : 'views/newentrysubmitted.html', controller: entryController});
	$routeProvider.when('/error', { templateUrl : 'views/error.html', controller: mainController});

});