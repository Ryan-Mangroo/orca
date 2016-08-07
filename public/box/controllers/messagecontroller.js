function messageController($scope, $location, $routeParams, Message, Box) {
	log.info('|messageController|');
	$('#entryForm').hide();

	$scope.selectableMoods = {
		'angry': 1,
		'sad': 2,
		'neutral': 3,
		'happy': 4,
		'excited': 5
	};
	$scope.selectedMood = null;
	$scope.newEntrySubmitting = false;
	$scope.showEntryForm = false;
	$scope.newEntryPlaceholder = 'Your feedback...';

	$scope.loadBoxInfo = function(boxNumber, token) {
		log.info('Loading box info for: ' + boxNumber + ', t: ' + token);
		Box.getInfo(boxNumber, token,
		  function(boxInfo){
		  	if(boxInfo.error) {
		  		$scope.setBoxLoaded(false);
		  		$scope.setBoxInfo(null);
		  		$scope.changeView('view/error');
		  	} else {
		  		$scope.setBoxLoaded(true);
		  		$scope.setBoxInfo(boxInfo);
		  	}

		  },
		  function() {
		  	log.error('Something bad happened while loading box info');
		  	$scope.changeView('view/error');
		  }
		);
	};

	$scope.createMessage = function(messageContent) {
		var newMessage = {
			_box: $scope.boxInfo._id,
			mood: $scope.selectableMoods[$scope.selectedMood],
			content: messageContent
		};
		$scope.newEntrySubmitting = true;

		Message.create(newMessage,
		  function(createdMessage){
		  	log.info('Success');
		  	log.object(createdMessage);
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
		$scope.setBoxLoaded(false);
		var currentURL = $location.url();
		var tokenIndex = currentURL.indexOf('?t=');

		// If no token is given, redirect to error
		if(tokenIndex < 0) {
			$scope.changeView('view/error');
			return;
		}

		// Grab the token. If null, redirect to error
		var token = $routeParams.t;
		if(token.length == 0) {
			$scope.changeView('view/error');
			return;
		}

		// If no box number is given, redirect to error
		var boxNumber = currentURL.slice(0, tokenIndex).slice(1);// Also remove the slash
		if(boxNumber. length == 0) {
			$scope.changeView('view/error');
			return;
		}

		// One last check to ensure that the box number is numeric




		// Only now that we have a box number and token, can we see if it's valid.
		$scope.loadBoxInfo(boxNumber, token);
	};

	$scope.initMessageController();


}