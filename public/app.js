var App = angular.module('App', ['ngRoute', 'ngAnimate']);

// Controllers
App.controller('mainController', mainController);

// Factories
App.factory('Entry', Entry);

App.config(function($routeProvider) {
	$routeProvider.when('/', { templateUrl : 'views/home.html', controller: homeController});
	$routeProvider.when('/home', { templateUrl : 'views/home.html', controller: homeController});
	$routeProvider.when('/entries', { templateUrl : 'views/entrylist.html', controller: entryController});
	$routeProvider.when('/entries/:entry', { templateUrl : 'views/entry.html', controller: entryController});
	$routeProvider.when('/settings', { templateUrl : 'views/settings.html', controller: settingsController});
	$routeProvider.when('/support', { templateUrl : 'views/support.html', controller: supportController});
});