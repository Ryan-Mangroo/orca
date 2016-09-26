function accountController($scope, $location, Account, Inbox) {
	$scope.allowEditCompany = false;
	$scope.allowEditPersonal = false;
	$scope.allowEditPassword = false;

	$scope.companySubmitting = false;
	$scope.personalSubmitting = false;
	$scope.passwordSubmitting = false;

	$scope.companyInfo = {};
	$scope.personalInfo = {};
	$scope.passwordInfo = {};

	$scope.allowEditLogo = false;
	$scope.accountLogoSource = $scope.currentUser.account.logo;
	$scope.accountLogoFile = null;

	$scope.computeSectionStyle = function(sectionName) {
		var disabled = true;
		var isFocused = false;

		if(sectionName == 'logo' || sectionName == 'mainBoxLink' || sectionName == 'planDetails') {
			disabled = ($scope.allowEditCompany || $scope.allowEditPersonal);
		} else if(sectionName == 'company') {
			isFocused = $scope.allowEditCompany;
			disabled = $scope.allowEditPersonal || $scope.allowEditPassword || $scope.allowEditLogo;
		} else if(sectionName == 'personal') {
			isFocused = ($scope.allowEditPersonal || $scope.allowEditPassword);
			disabled = $scope.allowEditCompany || $scope.allowEditLogo;
		}

		var style = {};
		if(disabled) {
			style.opacity = '.5';
		} else {
			style.opacity = '1';
		}

		if(isFocused) {
			style['background-color'] = '#fff';
			style['border-radius'] = '5px';
		} else {
			style['background'] = 'none';
		}
		return style;
	};

	$scope.editCompanyInfo = function() {
		$scope.allowEditCompany = true;
	};

	$scope.editPersonalInfo = function() {
		$scope.allowEditPersonal = true;
	};

	$scope.editPassword = function() {
		$scope.allowEditPassword = true;
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
			  	$scope.allowEditPassword = false;
			  	$scope.clearAlerts();
			  	$scope.toggleAlert('success', true, 'Password updated.');
		  	}
		  },
		  function() {
			window.location = 'http://www.workwoo.com/404.html';
		  }
		);
	};

	$scope.cancelEditPassword = function() {
		$scope.passwordInfo = {};
		$scope.allowEditPassword = false;
	};

	$scope.saveCompany = function(companyInfo) {
		$scope.companySubmitting = true;
		Account.updateCompany(companyInfo, 
		  function(updatedAccount){
		  	$scope.setUserAccount(updatedAccount);
		  	$scope.companySubmitting = false;
		  	$scope.allowEditCompany = false;
		  	$scope.clearAlerts();
		  	$scope.toggleAlert('success', true, 'Company information updated');
		  },
		  function() {
		  	window.location = 'http://www.workwoo.com/404.html';
		  }
		);
	};

	$scope.cancelSaveCompany = function() {
		$scope.setCompanyInfo();
		$scope.allowEditCompany = false;
	};

	$scope.savePersonal = function(personalInfo) {
		$scope.personalSubmitting = true;
		Account.updateUser(personalInfo, 
		  function(updatedUser){
		  	$scope.setUser(updatedUser);
		  	$scope.personalSubmitting = false;
		  	$scope.allowEditPersonal = false;
		  	$scope.clearAlerts();
		  	$scope.toggleAlert('success', true, 'Personal information updated');

		  },
		  function() {
		  	window.location = 'http://www.workwoo.com/404.html';
		  }
		);
	};

	$scope.cancelSavePersonal = function() {
		$scope.setPersonalInfo();
		$scope.allowEditPersonal = false;
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
		$scope.allowEditLogo = true;
		$scope.$apply(function(scope) {
			var imageFile = element.files[0];
			$scope.accountLogoFile = imageFile;
			var reader = new FileReader();
			reader.readAsDataURL(imageFile);
			reader.onload = function(e) {
				$scope.accountLogoSource = reader.result;
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
		  	$scope.allowEditLogo = false;
		  	$scope.clearAlerts();
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
		$scope.allowEditLogo = false;
	};

	$scope.setAccountLogoSource = function(src) {
		$scope.accountLogoSource = src;
	};

	$scope.setCompanyInfo();
	$scope.setPersonalInfo();
}