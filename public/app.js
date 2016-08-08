var App = angular.module('App', ['ngRoute', 'ngAnimate']);

// Controllers
App.controller('mainController', mainController);
App.controller('homeController', homeController);
App.controller('loginController', loginController);
App.controller('messageController', messageController);
App.controller('accountController', accountController);
App.controller('supportController', supportController);

// Factories
App.factory('Message', Message);
App.factory('User', User);
App.factory('Homepage', Homepage);
App.factory('Account', Account);

// Directives
App.directive('dateTimePicker', dateTimePicker);

// Routes
App.config(function($routeProvider) {
	$routeProvider.when('/', { templateUrl : 'views/home.html', controller: homeController});
	$routeProvider.when('/home', { templateUrl : 'views/home.html', controller: homeController});
	$routeProvider.when('/login', { templateUrl : 'views/login.html', controller: loginController});
	$routeProvider.when('/messages', { templateUrl : 'views/messagelist.html', controller: messageController});
	$routeProvider.when('/messages/:message', { templateUrl : 'views/entry.html', controller: messageController});
	$routeProvider.when('/account', { templateUrl : 'views/account.html', controller: accountController});
	$routeProvider.when('/upgrade', { templateUrl : 'views/upgrade.html', controller: supportController});
	$routeProvider.when('/support', { templateUrl : 'views/support.html', controller: supportController});
});