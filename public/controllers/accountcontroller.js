function accountController($scope, $location) {
	log.info('|accountController|');
	$scope.allowEditCompany = false;

	$scope.editCompany = function() {
		$scope.allowEditCompany = true;
	};


	$scope.saveCompany = function() {
		$scope.allowEditCompany = false;
	};

	$scope.cancelSaveCompany = function() {
		$scope.allowEditCompany = false;
	};


}