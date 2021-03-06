function inboxController($scope, $location, Message) {
	$scope.messages = [];
	$scope.messagesLoading = true;
	$scope.firstLoad = true;
	$scope.searched = false;
	$scope.selectedMessages = [];

	$scope.inboxID = null;
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

	$scope.search = function(searchTerm) {
		$scope.searchTerm = searchTerm;
		$scope.searched = true;
		$scope.loadInbox();
	};

	$scope.loadInbox = function() {
		$scope.messagesLoading = true;

	    var queryParams = {
	      inboxID: $scope.inboxID,
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
	        $scope.messagesLoading = false;
	        $scope.anchorValue = result.newAnchorValue;
	        $scope.anchorID = result.newAnchorID;
	        $scope.messages = result.messages
	        $scope.firstLoad = false;
	      },
	      function() {
	      	window.location = 'http://www.workwoo.com/404.html';
	      }
	    );
	};

	$scope.deleteMessages = function() {
	    Message.delete($scope.selectedMessages,
	      function(){
	        // Success
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
	        window.location = 'http://www.workwoo.com/404.html';
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
			window.location = 'http://www.workwoo.com/#/login';
			return;
		}

	    var currentURL = $location.url();
	    $scope.inboxID = currentURL.slice(7,currentURL.length);
		$scope.loadInbox();

	};

	$scope.initInboxController();
}