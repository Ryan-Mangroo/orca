function accountController($scope, $location, Account) {
	log.info('|accountController|');
	$scope.allowEditCompany = false;
	$scope.allowEditPersonal = false;
	$scope.allowEditPassword = false;

	$scope.companySubmitting = false;
	$scope.personalSubmitting = false;
	$scope.passwordSubmitting = false;

	$scope.companyInfo = {};
	$scope.personalInfo = {};
	$scope.passwordInfo = {};

	$scope.computeSectionStyle = function(sectionName) {
		var disabled = true;
		var isFocused = false;

		if(sectionName == 'logo' || sectionName == 'mainBoxLink' || sectionName == 'planDetails') {
			disabled = ($scope.allowEditCompany || $scope.allowEditPersonal);
		} else if(sectionName == 'company') {
			isFocused = $scope.allowEditCompany;
			disabled = $scope.allowEditPersonal || $scope.allowEditPassword;
		} else if(sectionName == 'personal') {
			isFocused = ($scope.allowEditPersonal || $scope.allowEditPassword);
			disabled = $scope.allowEditCompany;
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
		  	log.info('Password update attempted');
		  	log.object(result);

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
			  	$scope.toggleAlert('success', true, 'You password has been updated.');
		  	}
		  },
		  function() {
			$scope.clearAlerts();
			$scope.toggleAlert('danger', true, 'Something bad happened trying to update your password.');
		  	$scope.passwordSubmitting = false;
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
		  	$scope.toggleAlert('success', true, 'Your company information has been updated');
		  },
		  function() {
		  	$scope.companySubmitting = false;
		  	$scope.allowEditCompany = false;
		  	$scope.clearAlerts();
		  	$scope.toggleAlert('danger', true, 'Something bad happened while updating your company information');
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
		  	$scope.toggleAlert('success', true, 'Your personal information has been updated');

		  },
		  function() {
		  	$scope.personalSubmitting = false;
		  	$scope.allowEditPersonal = false;
		  	$scope.clearAlerts();
		  	$scope.toggleAlert('danger', true, 'Something bad happened while updating your personal information');
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

	$scope.loadUsageCharts = function() {
		$scope.setChartData('#chartUsers', 4, 5);
		$scope.setChartData('#chartInboxes', 1, 5);
		$scope.setChartData('#chartMessages', 27, 100);
	};

	$scope.setChartData = function(chartID, used, available) {
		
		// Determine the percentage used
		var sliceClassName = 'usageBase';
		var percentUsed = (100 * used)/available;
		var percentRemaining = 100 - percentUsed;

		if(percentUsed <= 50) {
			sliceClassName = 'usageGreen';
		} else if(percentUsed > 50 && percentUsed <= 75) {
			sliceClassName = 'usageYellow';
		} else if(percentUsed > 75) {
			sliceClassName = 'usagered';
		}

		var seriesData = {
			series: [
				{ value: percentUsed, className: sliceClassName, },
				{ value: percentRemaining, className: 'usageBase'}
			]
		};
		
		var options = { showLabel: false };
		new Chartist.Pie(chartID, seriesData, options);
		
	};

	$scope.loadUsageCharts();
	$scope.setCompanyInfo();
	$scope.setPersonalInfo();
}