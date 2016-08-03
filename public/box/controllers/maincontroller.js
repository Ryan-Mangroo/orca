function mainController($scope, $location) {
	log.info('|mainController|');

	$scope.changeView = function(viewName) {
    	$location.path(viewName);
  	};

}