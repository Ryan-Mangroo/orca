function entryController($scope, $location, Entry) {
	log.info('|entryController|');
	$scope.singleEntry = {};
	$scope.entries = [];
	$scope.entriesLoading = true;

	$scope.getAllEntries = function() {
		Entry.getAll(null,
		  function(entries){
		  	$scope.entries = entries;
		  	$scope.entriesLoading = false;
		  },
		  function() {
		  	log.error('Something bad happened getting all entries');
		  }
		);
	};

	$scope.getOneEntry = function(entryNumber) {
		Entry.getOne(entryNumber,
		  function(singleEntry){

		  	log.info('Success');
		  	log.object(singleEntry);

		  	$scope.singleEntry = singleEntry;
		  	$scope.entriesLoading = false;
		  },
		  function() {
		  	log.error('Something bad happened getting single entry');
		  }
		);
	};

	$scope.leaveComment = function() {
		$scope.singleEntry.notes.push({ author: 'Jesse', note: 'Yes, we should' });
		$scope.singleEntry.notes.reverse();
	};

	$scope.initEntryController = function() {
		if(!$scope.ensureAuthenticated) {
			$scope.changeView('login');
			return;
		}
	    var currentURL = $location.url().replace('/account/users', '');

	    if(currentURL.indexOf('/entries/') >= 0) {
	    	log.info('Viewing One');
	    	var entryNumber = currentURL.slice(9,currentURL.length);
	    	log.info(entryNumber);
	    	$scope.getOneEntry(entryNumber);
	    } else {
			setTimeout(function(){
				$scope.getAllEntries();
			}, 250)
	    }
	};

	$scope.initEntryController();

}