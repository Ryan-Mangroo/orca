var App = angular.module('App', ['ngRoute', 'ngAnimate']);

// Controllers
App.controller('mainController', mainController);
App.controller('messageController', messageController);
App.controller('errorController', errorController);
App.controller('submittedController', submittedController);

// Factories
App.factory('Message', Message);
App.factory('Box', Box);

App.config(function($routeProvider) {
	$routeProvider.when('/', { templateUrl : 'views/error.html', controller: 'errorController'});
	$routeProvider.when('/view', { templateUrl : 'views/error.html', controller: 'errorController'});
	$routeProvider.when('/view/:number', { templateUrl: 'views/newentry.html', controller: 'messageController'});
	$routeProvider.when('/submitted', { templateUrl : 'views/newentrysubmitted.html', controller: 'submittedController'});
	$routeProvider.when('/error', { templateUrl : 'views/error.html', controller: 'errorController'});

});