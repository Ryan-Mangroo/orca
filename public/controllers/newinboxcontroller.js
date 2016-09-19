function newInboxController($scope, $location, Inbox) {
	log.info('|newInboxController|');
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
		  	$scope.inboxSubmitting = false;
		  	$scope.clearAlerts();
		  	$scope.toggleAlert('danger', true, 'Inbox creation fail');
		  }
		);
	};


}