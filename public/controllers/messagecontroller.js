function messageController($scope, $location, Message) {
	log.info('|messageController|');
	$scope.singleMessage = {};
	$scope.messagesLoading = true;
	$scope.newComment = null;

	$scope.getOneMessage = function(messageID) {
		Message.getOne(messageID,
		  function(singleMessage){
		  	$scope.singleMessage = singleMessage;
		  	$scope.messagesLoading = false;
		  },
		  function() {
		  	window.location = 'http://www.workwoo.com/404.html';
		  }
		);
	};

	$scope.deleteSingleMessage = function(messageID, inboxID) {
	    Message.delete([messageID],
	      function(){
	        // Success
	        $scope.clearAlerts();
			$scope.toggleAlert('success', true, 'Message deleted');
	        $scope.changeView('inbox/' + inboxID);
	      },
	      function() {
	        window.location = 'http://www.workwoo.com/404.html';
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
		  	window.location = 'http://www.workwoo.com/404.html';
		  }
		);
	};


	$scope.initMessageController = function() {
		if(!$scope.ensureAuthenticated) {
			window.location = 'http://www.workwoo.com/#/login';
		}
	    var currentURL = $location.url();

    	var messageID = currentURL.slice(9,currentURL.length);
    	$scope.getOneMessage(messageID);

	};

	$scope.initMessageController();

}