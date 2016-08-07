function loginController($scope, $location, User) {
	log.info('|loginController|');

	$scope.credentials = { emailAddress: '', password: '' };

	$scope.login = function(credentials) {
		User.login(credentials,
		  function(userProfile){
		  	log.info('Login success!');
		  	log.object(userProfile);
		  	$scope.changeView('home');
		  },
		  function() {
		  	log.error('Something bad happened while logging in');
		  }
		);
	};
}