function mainController($scope, $location, $routeParams) {
	log.info('|mainController|');
	$scope.boxLoaded = false;
	$scope.boxInfo = null;

	$scope.setBoxLoaded = function(loaded) {
		$scope.boxLoaded = loaded
	};

	$scope.setBoxInfo = function(boxInfo) {
		log.object(boxInfo);

		$scope.boxInfo = boxInfo;
	};

	$scope.changeView = function(viewName) {
    	$location.path(viewName);
  	};
}