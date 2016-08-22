function messageController($scope, $location, Message) {
	log.info('|messageController|');
	$scope.singleMessage = {};
	$scope.messages = [];
	$scope.messagesLoading = true;
	$scope.selectedMessages = [];
	$scope.listTitle = 'All Feedback'
	$scope.newComment = null;
	$scope.selectAll = true; // used by the "Select all" checkbox, to toggle back and forth between T/F

	$scope.toggleAll = function() {
		if ($scope.selectAll) {
			for (var i=0; i<$scope.messages.length; i++) {
				var messageID = $scope.messages[i]._id;
				$scope.selectedMessages.push(messageID);
			}
		} else {
			$scope.selectedMessages = [];
		}
		$scope.selectAll = !$scope.selectAll; // The opposite action will happen on next click
	};

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

	$scope.deleteMessages = function() {
        log.info('Selected Messages: [ ' + $scope.selectedMessages + ' ]');
	    Message.delete($scope.selectedMessages,
	      function(){
	        // Success
	        log.info('Delete success');
		    var remainingMessages = [];
	        for(var i=0; i<$scope.messages.length; i++) {
	        	var messageID = $scope.messages[i]._id;
	        	if($scope.selectedMessages.indexOf(messageID) < 0) {
	        		remainingMessages.push($scope.messages[i]);
	        	}
	        }

	        if($scope.selectedMessages.length == 1) {
	        	$scope.toggleAlert('success', true, 'Message deleted');
	        } else {
	        	$scope.toggleAlert('success', true, $scope.selectedMessages.length + ' messages deleted');
	        }
	        $scope.selectedMessages = [];
	        $scope.messages = remainingMessages;
	      },
	      function() {
	        // Fail
	        log.info('Delete fail');
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

	$scope.archiveSingleMessage = function(messageID) {
		log.info('Archiving message: ' + messageID);
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
	    	var messageID = currentURL.slice(10,currentURL.length);
	    	log.info(messageID);
	    	$scope.getOneMessage(messageID);
	    } else {
			$scope.getAllMessages();

	    }
	};

	$scope.initMessageController();

}