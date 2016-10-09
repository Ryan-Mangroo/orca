function newUserController($scope, $location, Account) {
	$scope.clearAlerts();
	$scope.newUser = {};
	$scope.userSubmitting = false;

  	$scope.createUser = function(newUser) {
  		log.info('Creating user');
  		$scope.userSubmitting = true;
		Account.createUser(newUser, 
		  function(newUser){
		  	$scope.userSubmitting = false;
		  	$scope.changeView('settings/user/edit/' + newUser._id);
		  },
		  function() {
		  	window.location = 'http://www.workwoo.com/404.html';
		  }
		);
	};
}