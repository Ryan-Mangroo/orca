function messageController($scope, $location, Message) {
	log.info('|messageController|');
	$scope.singleMessage = {};
	$scope.messages = [];
	$scope.messagesLoading = true;
	$scope.selectedMessages = [];

	$scope.getAllMessages = function() {
		Message.getAll(null,
		  function(messages){
		  	$scope.messages = messages;
		  	$scope.messagesLoading = false;
		  },
		  function() {
		  	log.error('Something bad happened getting all messages');
		  }
		);
	};

	$scope.getOneMessage = function(messageNumber) {
		Message.getOne(messageNumber,
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

	$scope.deleteMessages = function() {
        var deletedMessageCount = $scope.selectedMessages.length;
        log.info('Messages being deleted: ' + deletedMessageCount);
        log.info('Selected Messages: [ ' + $scope.selectedMessages + ' ]');

	    Message.delete($scope.selectedMessages,
	      function(){
	        // Success
	        log.info('Delete success');
	        var deletedMessageCount = $scope.selectedMessages.length;

	        for(var i=0; i<$scope.messages.length; i++) {
	        	var messageID = $scope.messages[i]._id;
	        	var messageIndex = $scope.selectedMessages.indexOf(messageID);
	        	log.info(messageID);

	        	if(messageIndex >= 0) {
	        		log.info('Needs deleting');
	        		$scope.messages.splice(i, 1);
	        	}
	        }
	      },
	      function() {
	        // Fail
	        log.info('Delete fail');
	      }
	    );
	};


	$scope.toggleSelectedMessage = function(messageID) {
		var messageIndex = $scope.selectedMessages.indexOf(messageID);

		// Is currently selected
		if (messageIndex > -1) {
			$scope.selectedMessages.splice(messageIndex, 1);
		} else {
			$scope.selectedMessages.push(messageID);
		}
	};


	$scope.initMessageController = function() {
		if(!$scope.ensureAuthenticated) {
			$scope.changeView('login');
			return;
		}
	    var currentURL = $location.url();

	    if(currentURL.indexOf('/messages/') >= 0) {
	    	log.info('Viewing one message');
	    	var messageNumber = currentURL.slice(9,currentURL.length);
	    	log.info(messageNumber);
	    	$scope.getOneMessage(messageNumber);
	    } else {
			$scope.getAllMessages();

	    }
	};

	$scope.initMessageController();

}