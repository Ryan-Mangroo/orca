function editUserController($scope, $location, User) {
	$scope.clearAlerts();
	$scope.userLoading = true;
	$scope.userSubmitting = false;
	$scope.selectedUser = {};

  	$scope.loadUserInfo = function(userID) {
  		User.getOneUserInfo(userID,
			function(userInfo){
				$scope.userLoading = false;
				$scope.selectedUser = userInfo;
			},
			function() {
				window.location = 'http://www.workwoo.com/404.html';
			}
		);
  	};

  	$scope.saveUser = function(selectedUser) {
  		log.object(selectedUser);
  		$scope.userSubmitting = true;
		User.update(selectedUser, 
		  function(userUpdated){
		  	$scope.clearAlerts();
		  	$scope.userSubmitting = false;
		  	$scope.toggleAlert('success', true, 'User updated');
		  },
		  function() {
		  	window.location = 'http://www.workwoo.com/404.html';
		  }
		);
	};

  	$scope.resetPassword = function() {
  		$scope.userSubmitting = true;
		Inbox.resetToken($scope.selectedInbox._id, 
			function(updatedInbox){
				$("#tokenResetModal").modal('hide');
				$scope.userSubmitting = false;
		  		$scope.clearAlerts();
		  		$scope.toggleAlert('success', true, 'Password reset email sent');
			},
			function() {
				window.location = 'http://www.workwoo.com/404.html';
			}
		);
	};

	$scope.deleteUser = function() {
  		$scope.userSubmitting = true;
		User.delete($scope.selectedUser._id,
			function(result){
			  	$scope.clearAlerts();
			  	$scope.userSubmitting = false;
			  	$scope.toggleAlert('success', true, 'User Deleted');
			  	$scope.changeView('settings');
			},
			function() {
				window.location = 'http://www.workwoo.com/404.html';
			}
		);
	};

	$scope.initEditUserController = function() {
		if(!$scope.ensureAuthenticated) {
			window.location = 'http://www.workwoo.com/#/login';
			return;
		}
	    var currentURL = $location.url();
	    var userID = currentURL.slice(20,currentURL.length);
		$scope.loadUserInfo(userID);
	};

	$scope.initEditUserController();

}