function mainController($scope, $location, User, Inbox, BASE_URL) {
	$scope.baseURL = BASE_URL;
	$scope.accountInboxes = [];
	$scope.accountInboxesObject = {};
	
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

  	$scope.setPrimaryInbox = function(inboxInfo) {
  		$scope.currentUser.account._primary_inbox = inboxInfo;
  	};

  	$scope.setAccountLogo = function(imageURL) {
  		$scope.currentUser.account.logo = imageURL;
  	};

  	$scope.setUserAccount = function(accountInfo) {
  		$scope.currentUser.account = accountInfo;
  	};

  	$scope.setUser = function(personalInfo) {
  		$scope.currentUser = personalInfo;
  	};

  	$scope.computeRequiredInputStyle = function(formField) {
  		var inputClass = '';
  		if(formField.$valid && !formField.$dirty) {
  			inputClass = 'inputRequiredValid';
  		} else if(formField.$valid && formField.$dirty) {
  			inputClass = 'inputRequiredValidDirty';
  		} else if(formField.$invalid) {
  			inputClass = 'inputRequiredInvalid';
  		}
  		return inputClass;
  	};


  	$scope.loadAllInboxInfo = function() {
  		Inbox.getAllInboxInfo(
			function(inboxes){
				// Save the resulting inboxes but also convert the array of inboxes into
				// an an object with each inbox ID as the key andthe info as the value
				$scope.accountInboxes = inboxes;
				for(var i=0; i<inboxes.length; i++) {
					$scope.accountInboxesObject[inboxes[i]._id] = inboxes[i];
				}
				
			},
			function() {
				window.location = 'http://www.workwoo.com/404.html';
			}
		);
  	};

	$scope.ensureAuthenticated = function() {
		if($scope.currentUser) {
			$scope.authenticated = true;
		} else {
			User.getProfile(
			  function(userProfile){
			  	$scope.currentUser = userProfile;
			  	$scope.authenticated = true;
			  	$scope.loadAllInboxInfo();
			  },
			  function() {
			  	$scope.authenticated = false;
			  	window.location = CONFIG.UNAUTH_URL;
			  }
			);
		}
	};

	$scope.initMainController = function() {
		$scope.ensureAuthenticated();
	};

	$scope.initMainController();
}