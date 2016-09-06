function inboxController($scope, $location, Message) {
	log.info('|inboxController|');

	$scope.messages = [];
	$scope.inboxLoading = true;
	$scope.selectedMessages = [];
	$scope.listTitle = 'All Feedback'
	$scope.inboxNumber = null;
	$scope.selectAll = true; // used by the "Select all" checkbox, to toggle T/F

	// Search query components
	$scope.anchorValue = null;
	$scope.anchorID = null;
	$scope.sortField = 'created_at';
	$scope.sortOrder = 'desc';
	$scope.searchTerm = null;
	$scope.queryCriteria = null;


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


	$scope.loadInbox = function() {
		$scope.inboxLoading = true;

	    var queryParams = {
	      inboxNumber: $scope.inboxNumber,
	      sortField: $scope.sortField,
	      sortOrder: $scope.sortOrder,
	      anchorValue: $scope.anchorValue,
	      anchorID: $scope.anchorID,
	      searchTerm: $scope.searchTerm,
	      additionalQuery: $scope.queryCriteria,
	    };

	    Message.search(queryParams,
	      function(result){
	        // Success
	        log.info('SUCCESS');
	        log.object(result);

	        $scope.inboxLoading = false;
	        $scope.anchorValue = result.newAnchorValue;
	        $scope.anchorID = result.newAnchorID;
	        $scope.messages = result.messages
	      },
	      function() {
	        log.info('FAIL');
	      }
	    );
	  };



	$scope.search = function() {
		Message.getAll($scope.inboxNumber,
		  function(messages){
		  	$scope.messages = messages;
		  	$scope.inboxLoading = false;
		  },
		  function() {
		  	log.error('Something bad happened getting all messages');
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

	$scope.toggleSelectedMessage = function(messageID) {
		var messageIndex = $scope.selectedMessages.indexOf(messageID);

		// Is currently selected
		if (messageIndex > -1) {
			$scope.selectedMessages.splice(messageIndex, 1);
		} else {
			$scope.selectedMessages.push(messageID);
		}
	};


	$scope.initInboxController = function() {
		if(!$scope.ensureAuthenticated) {
			$scope.changeView('login');
			return;
		}

	    var currentURL = $location.url();
	    $scope.inboxNumber = currentURL.slice(7,currentURL.length);
		$scope.loadInbox();

	};

	$scope.initInboxController();

}