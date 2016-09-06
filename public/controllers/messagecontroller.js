function messageController($scope, $location, Message) {
	log.info('|messageController|');
	$scope.singleMessage = {};
	$scope.messagesLoading = true;

	$scope.newComment = null;


	$scope.getOneMessage = function(messageID) {
		Message.getOne(messageID,
		  function(singleMessage){

		  	log.info('Success');
		  	log.object(singleMessage);

		  	$scope.singleMessage = singleMessage;
		  	$scope.messagesLoading = false;
		  },
		  function() {
		  	log.error('Something bad happened getting single message');
		  }
		);
	};

	$scope.deleteSingleMessage = function(messageID) {
	    Message.delete([messageID],
	      function(){
	        // Success
	        log.info('Delete success');
	        $scope.clearAlerts();
			$scope.toggleAlert('success', true, 'Message deleted');
	        $scope.changeView('messages');
	      },
	      function() {
	        // Fail
	        log.info('Delete single fail');
	      }
	    );
	};

	$scope.addComment = function(commentText) {
		log.info(commentText);
		log.info($scope.singleMessage._id);
		Message.addComment($scope.singleMessage._id, commentText,
		  function(result){
		  	$scope.newComment = null;
		  	$scope.singleMessage = result;
		  },
		  function() {
		  	log.info('FAIL');
		  }
		);
	};


	$scope.initMessageController = function() {
		if(!$scope.ensureAuthenticated) {
			$scope.changeView('login');
			return;
		}
	    var currentURL = $location.url();

    	var messageID = currentURL.slice(9,currentURL.length);
    	log.info('Loaded message: ' + messageID);
    	$scope.getOneMessage(messageID);

	};

	$scope.initMessageController();

}