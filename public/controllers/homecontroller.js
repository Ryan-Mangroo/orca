function homeController($scope, $location) {
	log.info('|homeController|');
	$scope.setPageTitle('Home', 'fa-home');

	$scope.initHomeController = function() {
		if(!$scope.ensureAuthenticated()) {
			$scope.changeView('login');
			return;
		}
	};

	$scope.initHomeController();


}