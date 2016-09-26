function newInboxController($scope, $location, Inbox) {
	$scope.clearAlerts();
	$scope.newInbox = {};
	$scope.inboxSubmitting = false;

  	$scope.createInbox = function(newInbox) {
  		$scope.inboxSubmitting = true;
		Inbox.create(newInbox, 
		  function(newInbox){
		  	$scope.inboxSubmitting = false;
		  	$scope.loadAllInboxInfo();
		  	$scope.changeView('account/inbox/edit/' + newInbox._id);
		  },
		  function() {
		  	window.location = 'http://www.workwoo.com/404.html';
		  }
		);
	};
}