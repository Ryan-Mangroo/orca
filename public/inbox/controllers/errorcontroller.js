function errorController($scope, $location) {
	log.info('|errorController|');
	$scope.setInboxLoaded(false);
	$scope.setInboxInfo(null);
	$('#guarantee').hide();
	$location.url($location.path());
}