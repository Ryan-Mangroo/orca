function mainController($scope, $location, User) {
	log.info('|mainController|');

	$scope.authenticated = false;
	$scope.pageTitleIcon = '';
	$scope.pageTitleText = '';

	$scope.changeView = function(viewName) {
    	$location.path(viewName);
  	};

	$scope.currentUser = null

	$scope.setPageTitle = function(title, iconClass) {
		$scope.pageTitleText = title;
		$scope.pageTitleIcon = iconClass;
	}

	$scope.ensureAuthenticated = function() {
		if($scope.currentUser) {
			log.info('ensureAuthenticated: TRUE');
			return true;
		} else {
			User.getProfile(
			  function(userProfile){

			  	$scope.currentUser = userProfile;
			  	$scope.authenticated = true;
			  	log.info('Authenticate success!');
			  	return true;
			  },
			  function() {
			  	$scope.changeView('login');
			  	log.error('Something bad happened while authenticating');
			  	return false;
			  }
			);
		}
	};


	$scope.initMainController = function() {
		$scope.ensureAuthenticated();
	};

	$scope.initMainController();
}