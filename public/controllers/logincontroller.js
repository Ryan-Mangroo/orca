function loginController($scope, $location, User) {
	log.info('|loginController|');

	$scope.credentials = { email: '', password: '' };

	$scope.login = function(credentials) {

		log.info(credentials);
		log.object(credentials);
		return;

		User.login(credentials,
		  function(userProfile){
		  	log.info('Login success!');
		  	log.object(userProfile);
		  },
		  function() {
		  	log.error('Something bad happened while logging in');
		  }
		);
	};
}