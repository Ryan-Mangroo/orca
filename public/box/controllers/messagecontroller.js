function messageController($scope, $location, Message, Box) {
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

	$scope.loadBoxInfo = function(boxNumber) {
		log.info('Loading box info for: ' + boxNumber);

		Box.getInfo(boxNumber,
		  function(boxInfo){

		  	$scope.setBoxLoaded(true);
		  	$scope.setBoxInfo(boxInfo);

		  	log.object(boxInfo);
		  },
		  function() {
		  	log.error('Something bad happened while loading box info');
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
		  	$scope.changeView('submitted');
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
		var currentURL = $location.url();
		var boxNumber = currentURL.slice(currentURL.indexOf('/view/') + 6, currentURL.length);

		if(!boxNumber) {
			$scope.changeView('error');
		} else {
			log.info('Found: ' + boxNumber);
			$scope.loadBoxInfo(boxNumber);
		}

	};

	$scope.initMessageController();


}