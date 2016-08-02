function mainController($scope, $location) {
	log.info('|mainController|');
	$scope.companyName = 'ServiceNow';
	$scope.companyLogoURL = 'https://mobilereach.com/wp-content/uploads/2015/06/service-now-logo.png?958b66';

	$scope.changeView = function(viewName) {
    	$location.path(viewName);
  	};
}