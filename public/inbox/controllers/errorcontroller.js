function errorController($scope, $location) {
	log.info('|errorController|');
	$scope.setBoxLoaded(false);
	$scope.setBoxInfo(null);
	$location.url($location.path());
}