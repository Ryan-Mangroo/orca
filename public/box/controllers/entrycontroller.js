function entryController($scope, $location, $routeParams, Entry) {
	log.info('|entryController|');
	$('#entryForm').hide();

	$scope.selectableMoods = ['angry', 'sad', 'neutral', 'happy', 'excited'];

  	$scope.newEntry = {};
	$scope.newEntrySubmitting = false;
	$scope.selectedMood = 'none';
	$scope.showEntryForm = false;

	$scope.newEntryPlaceholder = 'Your feedback...';

	$scope.createEntry = function(newEntry) {
		$scope.newEntrySubmitting = true;
		log.info('(Before)');
		log.object(newEntry);

		// Putting a delay for testing
		setTimeout(function() {
			Entry.new(newEntry,
			  function(createdEntry){
			  	log.info('(After)');
			  	log.object(createdEntry);
			  	$scope.newEntrySubmitting = false;
			  	$scope.changeView('submitted');
			  },
			  function() {
			  	log.error('Something bad happened creating the entry');
			  	$scope.newEntrySubmitting = false;
			  }
			);
		}, 1000);
	};

	$scope.setMood = function(selectedMood) {
		$scope.selectedMood = selectedMood;
		$scope.newEntryPlaceholder = 'What are you ' + selectedMood + ' about?';

		$('#moodQuestion').slideUp(200, function(){});
		$('#' + selectedMood + 'Mood').animate({ left: '0px', zIndex: '1' }, 200);

		// First, hide the un-selected moods
		for(var i=0; i<$scope.selectableMoods.length; i++) {
			var singleMood = $scope.selectableMoods[i];
			if(singleMood != selectedMood) {
				$('#' + singleMood + 'Mood').animate({ zIndex: '0', opacity: '0' }, 200);
			}
		}
		
		// Then, show the text entry form
		$('#entryForm').slideDown(200, function(){ console.log('done') });
	};


	$scope.initEntryController = function() {
	if(!$routeParams.id) {
		$scope.changeView('error');
		return;
	}
	};


}