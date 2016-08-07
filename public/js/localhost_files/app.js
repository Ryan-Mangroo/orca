var App = angular.module('App', ['ngRoute', 'ngAnimate']);

// Controllers
App.controller('mainController', mainController);
App.controller('homeController', homeController);
App.controller('loginController', loginController);
App.controller('messageController', messageController);
App.controller('settingsController', settingsController);
App.controller('supportController', supportController);

// Factories
App.factory('Message', Message);
App.factory('User', User);
App.factory('Homepage', Homepage);

// Directives
App.directive('dateTimePicker', dateTimePicker);

// Routes
App.config(function($routeProvider) {
	$routeProvider.when('/', { templateUrl : 'views/home.html', controller: homeController});
	$routeProvider.when('/home', { templateUrl : 'views/home.html', controller: homeController});
	$routeProvider.when('/login', { templateUrl : 'views/login.html', controller: loginController});
	$routeProvider.when('/messages', { templateUrl : 'views/messagelist.html', controller: messageController});
	$routeProvider.when('/messages/:message', { templateUrl : 'views/entry.html', controller: messageController});
	$routeProvider.when('/settings', { templateUrl : 'views/settings.html', controller: settingsController});
	$routeProvider.when('/support', { templateUrl : 'views/support.html', controller: supportController});
});