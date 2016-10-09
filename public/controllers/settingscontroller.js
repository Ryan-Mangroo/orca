function settingsController($scope, $location, Account, Inbox) {
	$scope.companySubmitting = false;
	$scope.personalSubmitting = false;
	$scope.passwordSubmitting = false;

	$scope.companyInfo = {};
	$scope.personalInfo = {};
	$scope.passwordInfo = {};

	$scope.accountUsers = [];
	$scope.usersLoading = false;

	$scope.allowEditLogo = false;
	$scope.accountLogoSource = $scope.currentUser.account.logo;
	$scope.accountLogoFile = null;

	$scope.loadAccountUsers = function() {
		$scope.usersLoading = true;
		Account.getUsers(
		  function(result){
		  	if(result.error) {
		  		$scope.accountUsers = [];
		  		$scope.usersLoading = false;
		  	} else {
		  		$scope.accountUsers = result;
			  	$scope.usersLoading = false;
		  	}
		  },
		  function() {
			//log.info('Error getting users');
		  }
		);
	};

	$scope.savePassword = function(passwordInfo) {
		$scope.passwordSubmitting = true;
		Account.changeUserPassword(passwordInfo, 
		  function(result){
		  	if(result.error) {
		  		$scope.passwordInfo = {};
		  		$scope.passwordSubmitting = false;
		  		$scope.clearAlerts();
		  		$scope.toggleAlert('danger', true, result.message);
		  	} else {
		  		$scope.passwordInfo = {};
			  	$scope.passwordSubmitting = false;
			  	$scope.clearAlerts();
			  	$scope.toggleAlert('success', true, 'Password updated.');
		  	}
		  },
		  function() {
			window.location = 'http://www.workwoo.com/404.html';
		  }
		);
	};

	$scope.saveCompany = function(companyInfo) {
		$scope.companySubmitting = true;
		Account.updateCompany(companyInfo, 
		  function(updatedAccount){
		  	$scope.setUserAccount(updatedAccount);
		  	$scope.companySubmitting = false;
		  	$scope.clearAlerts();
		  	$scope.toggleAlert('success', true, 'Company information updated');
		  },
		  function() {
		  	window.location = 'http://www.workwoo.com/404.html';
		  }
		);
	};

	$scope.savePersonal = function(personalInfo) {
		$scope.personalSubmitting = true;
		Account.updateCurrentUser(personalInfo, 
		  function(updatedUser){
		  	$scope.setUser(updatedUser);
		  	$scope.personalSubmitting = false;
		  	$scope.clearAlerts();
		  	$scope.toggleAlert('success', true, 'Personal information updated');

		  },
		  function() {
		  	window.location = 'http://www.workwoo.com/404.html';
		  }
		);
	};

	$scope.setPersonalInfo = function() {
		$scope.personalInfo = {
			_id: $scope.currentUser.id,
			firstName: $scope.currentUser.firstName,
			lastName: $scope.currentUser.lastName,
			email: $scope.currentUser.email,
			phone: $scope.currentUser.phone,
			role: $scope.currentUser.role
		};
	};

	$scope.setCompanyInfo = function() {
		$scope.companyInfo = {
			_id: $scope.currentUser.account._id,
			name: $scope.currentUser.account.name,
			city: $scope.currentUser.account.city,
			state: $scope.currentUser.account.state,
			country: $scope.currentUser.account.country,
			email: $scope.currentUser.account.email,
			phone: $scope.currentUser.account.phone
		};
	};

	$scope.previewAccountLogo = function(element) {
		$scope.$apply(function(scope) {
			var imageFile = element.files[0];
			$scope.accountLogoFile = imageFile;
			var reader = new FileReader();
			reader.readAsDataURL(imageFile);
			reader.onload = function(e) {
				$scope.accountLogoSource = reader.result;
				$scope.allowEditLogo = true;
				$scope.$apply();
			};
		});
	};

	$scope.saveAccountLogo = function() {
		// First, request the logo URL from our server
		Account.getSignedLogoURL($scope.accountLogoFile.name, $scope.accountLogoFile.type, 
		  function(requestInfo){
		  	$scope.clearAlerts();
			$scope.saveAccountLogoToS3(requestInfo, $scope.accountLogoFile);
		  },
		  function() {
			window.location = 'http://www.workwoo.com/404.html';
		  }
		);
	};

	$scope.saveAccountLogoToS3 = function(requestInfo, imageFile) {
	  	// Then, send the file over to S3
		Account.saveLogoToS3(requestInfo.signedRequest, imageFile,
		  function(){
		  	$scope.clearAlerts();
		  	$scope.allowEditLogo = false;
		  	$scope.toggleAlert('success', true, 'Account logo updated');
		  	$scope.$apply();
		  },
		  function() {
		  	window.location = 'http://www.workwoo.com/404.html';
		  }
		);
	};

	$scope.cancelChangeLogo = function() {
		$scope.setAccountLogoSource($scope.currentUser.account.logo);
	};

	$scope.setAccountLogoSource = function(src) {
		$scope.accountLogoSource = src;
	};

	$scope.setCompanyInfo();
	$scope.setPersonalInfo();
	$scope.loadAccountUsers();
}