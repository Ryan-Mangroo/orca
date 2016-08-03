var App = angular.module('App', ['ngRoute', 'ngAnimate']);

// Controllers
App.controller('mainController', mainController);
App.controller('homeController', homeController);
App.controller('loginController', loginController);
App.controller('entryController', entryController);
App.controller('settingsController', settingsController);
App.controller('supportController', supportController);

// Factories
App.factory('Entry', Entry);
App.factory('User', User);

// Routes
App.config(function($routeProvider) {
	$routeProvider.when('/', { templateUrl : 'views/home.html', controller: homeController});
	$routeProvider.when('/home', { templateUrl : 'views/home.html', controller: homeController});
	$routeProvider.when('/login', { templateUrl : 'views/login.html', controller: loginController});
	$routeProvider.when('/entries', { templateUrl : 'views/entrylist.html', controller: entryController});
	$routeProvider.when('/entries/:entry', { templateUrl : 'views/entry.html', controller: entryController});
	$routeProvider.when('/settings', { templateUrl : 'views/settings.html', controller: settingsController});
	$routeProvider.when('/support', { templateUrl : 'views/support.html', controller: supportController});
});