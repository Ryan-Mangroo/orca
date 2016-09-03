function mainController($scope, $location, User) {
	log.info('|mainController|');
	
	$scope.successAlertVisible = false;
	$scope.successAlertText = null;
	$scope.dangerAlertVisible = false;
	$scope.dangerAlertText = null;
	$scope.infoAlertVisible = false;
	$scope.infoAlertText = null;

	$scope.authenticated = false;
	$scope.currentUser = null;
	$scope.moodMap = {
		'1': 'mad',
		'2': 'sad',
		'3': 'meh',
		'4': 'happy',
		'5': 'excited'
	};

	$scope.clearAlerts = function() {
		$scope.successAlertVisible = false;
		$scope.successAlertText = '';
		$scope.dangerAlertVisible = false;
		$scope.dangerAlertText = '';
		$scope.infoAlertVisible = false;
		$scope.infoAlertText = '';
	};


	$scope.toggleAlert = function(type, visibility, text) {
		// First, clear any other alerts, since only one can be visibile at a time
		$scope.clearAlerts();
		$scope[type + 'AlertVisible'] = visibility;
		$scope[type + 'AlertText'] = text;
	};


	$scope.alertUnknownError = function() {
		$scope.toggleAlert('danger', true, 'An error has occured. <a href="/app/#/help"><strong>Contact support</strong></a>');
	};


	$scope.formattedDateTime = function(dateTime) {
		return moment(dateTime).format('MM/DD/YYYY hh:mm A').slice(0, 10);
	} ;
	
	$scope.changeView = function(viewName) {
    	$location.path(viewName);
  	};

  	$scope.setUserAccount = function(accountInfo) {
  		$scope.currentUser.account = accountInfo;
  	};

  	$scope.setUser = function(personalInfo) {
  		$scope.currentUser = personalInfo;
  	};

	$scope.ensureAuthenticated = function() {
		if($scope.currentUser) {
			$scope.authenticated = true;
		} else {
			User.getProfile(
			  function(userProfile){
			  	$scope.currentUser = userProfile;
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