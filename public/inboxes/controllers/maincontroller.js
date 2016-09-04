function mainController($scope, $location, $routeParams) {
	log.info('|mainController|');
	$scope.inboxLoaded = false;
	$scope.inboxInfo = null;

	$scope.setInboxLoaded = function(loaded) {
		$scope.inboxLoaded = loaded
	};

	$scope.setInboxInfo = function(inboxInfo) {
		$scope.inboxInfo = inboxInfo;
	};

	$scope.changeView = function(viewName) {
    	$location.path(viewName);
  	};
}