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
			$scope.authenticated = true;
		} else {
			User.getProfile(
			  function(userProfile){
			  	log.object(userProfile);

			  	$scope.currentUser = userProfile;
			  	$scope.authenticated = true;
			  	log.info('Authenticate success!');
				$scope.authenticated = true;
			  },
			  function() {
			  	$scope.authenticated = false;
			  	window.location = "/login.html";
			  }
			);
		}
	};


	$scope.initMainController = function() {
		$scope.ensureAuthenticated();
	};

	$scope.initMainController();
}