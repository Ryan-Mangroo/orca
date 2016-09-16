function messageController($scope, $location, $routeParams, Message, Inbox) {
	log.info('|messageController|');
	$('#entryForm').hide();

	$scope.inboxStatus = '';

	$scope.selectableMoods = {
		'mad': 1,
		'sad': 2,
		'meh': 3,
		'happy': 4,
		'excited': 5
	};
	$scope.selectedMood = null;
	$scope.newEntrySubmitting = false;
	$scope.showEntryForm = false;
	$scope.newEntryPlaceholder = 'Your feedback...';

	$scope.loadInboxInfo = function(inboxNumber, token) {
		log.info('Loading inbox info for: ' + inboxNumber + ', t: ' + token);
		Inbox.getInfo(inboxNumber, token,
		  function(inboxInfo){
		  	if(inboxInfo.error) {
		  		$scope.setInboxLoaded(false);
		  		$scope.setInboxInfo(null);
		  		$scope.changeView('view/error');
		  	} else {

		  		$scope.inboxStatus = inboxInfo.status

		  		log.info($scope.inboxStatus);
		  		$scope.setInboxLoaded(true);
		  		$scope.setInboxInfo(inboxInfo);
		  	}

		  },
		  function() {
		  	log.error('Something bad happened while loading inbox info');
		  	$scope.changeView('view/error');
		  }
		);
	};

	$scope.createMessage = function(messageContent) {
		var newMessage = {
			_inbox: $scope.inboxInfo._id,
			mood: $scope.selectableMoods[$scope.selectedMood],
			content: messageContent
		};
		$scope.newEntrySubmitting = true;

		Message.create(newMessage,
		  function(createdMessage){
		  	$scope.newEntrySubmitting = false;
		  	$scope.changeView('view/submitted');
		  },
		  function() {
		  	log.error('Something bad happened creating the message');
		  	$scope.newEntrySubmitting = false;
		  }
		);

	};

	$scope.setMood = function(selectedMood) {
		$scope.selectedMood = selectedMood;
		$scope.newEntryPlaceholder = 'What are you ' + selectedMood + ' about?';

		$('#moodQuestion').slideUp(200, function(){});
		$('#' + selectedMood + 'Mood').animate({ left: '0px', zIndex: '1' }, 200);

		// First, hide the un-selected moods
		for(var singleMood in $scope.selectableMoods) {
			if(singleMood != selectedMood) {
				$('#' + singleMood + 'Mood').animate({ zIndex: '0', opacity: '0' }, 200);
			}
		}
		
		// Then, show the text entry form
		$('#entryForm').slideDown(200, function(){ console.log('done') });
	};


	$scope.initMessageController = function() {
		$scope.setInboxLoaded(false);
		var currentURL = $location.url();
		var tokenIndex = currentURL.indexOf('?t=');

		// If no token is given, redirect to error
		if(tokenIndex < 0) {
			$scope.changeView('error');
			return;
		}

		// Grab the token. If null, redirect to error
		var token = $routeParams.t;
		if(token.length == 0) {
			$scope.changeView('error');
			return;
		}

		// If no inbox number is given, redirect to error
		var inboxNumber = currentURL.slice(0, tokenIndex).slice(1);// Also remove the slash
		if(inboxNumber. length == 0) {
			$scope.changeView('error');
			return;
		}

		// Only now that we have a box number and token, can we see if it's valid.
		$scope.loadInboxInfo(inboxNumber, token);
	};

	$scope.initMessageController();
}