function mainController($scope, $location, User) {
	log.info('|mainController|');
	$scope.authenticated = false;
	$scope.currentUser = null;
	$scope.moodMap = {
		'1': 'angry',
		'2': 'sad',
		'3': 'neutral',
		'4': 'happy',
		'5': 'excited'
	};

	$scope.formattedDateTime = function(dateTime) {
		return moment(dateTime).format('MM/DD/YYYY hh:mm A').slice(0, 10);
	} ;

	$scope.changeView = function(viewName) {
    	$location.path(viewName);
  	};

	$scope.ensureAuthenticated = function() {
		if($scope.currentUser) {
			$scope.authenticated = true;
		} else {
			User.getProfile(
			  function(userProfile){

			  	log.object(userProfile);

			  	$scope.currentUser = userProfile;
			  	$scope.authenticated = true;
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