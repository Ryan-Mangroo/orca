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
	$routeProvider.when('/:number', { templateUrl: 'views/newentry.html', controller: 'messageController'});
	$routeProvider.when('/view/submitted', { templateUrl : 'views/newentrysubmitted.html', controller: 'submittedController'});
	$routeProvider.when('/view/error/', { templateUrl : 'views/error.html', controller: 'errorController'});

});