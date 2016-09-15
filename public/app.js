var App = angular.module('App', ['ngRoute', 'ngAnimate']);

// Controllers
App.controller('mainController', mainController);
App.controller('homeController', homeController);
App.controller('loginController', loginController);
App.controller('inboxController', inboxController);
App.controller('messageController', messageController);
App.controller('accountController', accountController);
App.controller('supportController', supportController);
App.controller('inboxConfigController', inboxConfigController);

// Factories
App.factory('Message', Message);
App.factory('User', User);
App.factory('Homepage', Homepage);
App.factory('Account', Account);
App.factory('Inbox', Inbox);

// Constants
App.constant('BASE_URL', CONFIG.BASE_URL);

// Directives 
App.directive('dateTimePicker', dateTimePicker);

// Routes
App.config(function($routeProvider) {
	$routeProvider.when('/', { templateUrl : 'views/home.html', controller: homeController});
	$routeProvider.when('/home', { templateUrl : 'views/home.html', controller: homeController});
	$routeProvider.when('/login', { templateUrl : 'views/login.html', controller: loginController});
	$routeProvider.when('/inbox/:inboxNumber', { templateUrl : 'views/inbox.html', controller: inboxController});
	$routeProvider.when('/message/:messageID', { templateUrl : 'views/message.html', controller: messageController});

	// Account, Inbox & User management
	$routeProvider.when('/account', { templateUrl : 'views/account.html', controller: accountController});
	$routeProvider.when('/account/inbox/config/:inboxID', { templateUrl : 'views/inboxconfig.html', controller: inboxConfigController});

	$routeProvider.when('/upgrade', { templateUrl : 'views/upgrade.html', controller: supportController});
	$routeProvider.when('/support', { templateUrl : 'views/support.html', controller: supportController});
});