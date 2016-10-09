var App = angular.module('App', ['ngRoute', 'ngAnimate']);

// Controllers
App.controller('mainController', mainController);
App.controller('staticController', staticController);
App.controller('homeController', homeController);
App.controller('inboxController', inboxController);
App.controller('messageController', messageController);
App.controller('settingsController', settingsController);
App.controller('supportController', supportController);
App.controller('editInboxController', editInboxController);
App.controller('newInboxController', newInboxController);
App.controller('newUserController', newUserController);
App.controller('editUserController', editUserController);

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
	// Basics
	$routeProvider.when('/', { templateUrl : 'views/home.html', controller: homeController});
	$routeProvider.when('/home', { templateUrl : 'views/home.html', controller: homeController});
	$routeProvider.when('/home/:inboxID', { templateUrl : 'views/home.html', controller: homeController});
	$routeProvider.when('/inbox/:inboxID', { templateUrl : 'views/inbox.html', controller: inboxController});
	$routeProvider.when('/message/:messageID', { templateUrl : 'views/message.html', controller: messageController});

	// Account, Inbox & User management
	$routeProvider.when('/settings', { templateUrl : 'views/settings.html', controller: settingsController});
	$routeProvider.when('/settings/inbox/edit/:inboxID', { templateUrl : 'views/editinbox.html', controller: editInboxController});
	$routeProvider.when('/settings/inbox/new', { templateUrl : 'views/newinbox.html', controller: newInboxController});
	$routeProvider.when('/settings/user/new', { templateUrl : 'views/newuser.html', controller: newUserController});
	$routeProvider.when('/settings/user/edit/:userID', { templateUrl : 'views/edituser.html', controller: editUserController});

	// Support form
	$routeProvider.when('/support', { templateUrl : 'views/support.html', controller: supportController});
	$routeProvider.when('/support/submitted', { templateUrl : 'views/supportsubmitted.html', controller: supportController});
	$routeProvider.when('/404', { templateUrl : 'views/404.html', controller: staticController});

	// Support & help pages
	$routeProvider.when('/support/gettingstarted', { templateUrl : 'views/support/gettingstarted.html', controller: supportController});
	$routeProvider.when('/support/customizeform', { templateUrl : 'views/support/customizeform.html', controller: supportController});
	$routeProvider.when('/support/dashboardconfig', { templateUrl : 'views/support/dashboardconfig.html', controller: supportController});
	$routeProvider.when('/support/inboxdashboards', { templateUrl : 'views/support/inboxdashboards.html', controller: supportController});
	$routeProvider.when('/support/inbox', { templateUrl : 'views/support/inbox.html', controller: supportController});
	$routeProvider.when('/support/messagecomment', { templateUrl : 'views/support/messagecomment.html', controller: supportController});
	$routeProvider.when('/support/addinginboxes', { templateUrl : 'views/support/addinginboxes.html', controller: supportController});
	$routeProvider.when('/support/addingusers', { templateUrl : 'views/support/addingusers.html', controller: supportController});
});