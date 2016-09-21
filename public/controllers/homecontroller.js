function homeController($scope, $location, $route, Homepage) {
	log.info('|homeController|');
	$scope.homeLoading = true;

	// Start by showing the primary inbox
	$scope.inboxID = $scope.currentUser.account._primary_inbox._id

	$scope.homepageID = null;
	$scope.homeKeywords = [];
	$scope.homeKeywordsOriginal = [];
	$scope.editableHomeKeywords = [];

	$scope.allowEditKeywordSummary = false;

	$scope.toggleEditKeywordSummary = function() {
		$scope.allowEditKeywordSummary = !$scope.allowEditKeywordSummary;
		if($scope.allowEditKeywordSummary) {
			// Copy the homepage keywords into a new array
			for(var i=0; i<$scope.homeKeywords.length; i++) {
				var keyword = { title: $scope.homeKeywords[i].title, value: $scope.homeKeywords[i].value }
				$scope.editableHomeKeywords.push(keyword);
				$scope.homeKeywordsOriginal.push(keyword);
			}
		} else {
			$scope.homeKeywords = $scope.homeKeywordsOriginal;
			$scope.homeKeywordsOriginal = [];
			$scope.editableHomeKeywords = [];
			$scope.allowEditKeywordSummary = false;

		}
		// Re-cycle the charts
		$scope.showHomepageGauges();
	};

	$scope.addSummaryKeyword = function() {
		var newKeyword = { title: 'New Word', value: 0 };
		$scope.editableHomeKeywords.push(newKeyword);
		$scope.homeKeywords.push(newKeyword);

		var keywordIndex = $scope.homeKeywords.length - 1;
  		var elementID = '#keyword_' + keywordIndex + '_gauge';
		$(elementID).empty();

		// Show the chart
		setTimeout(function(){
		  	$(elementID).circliful({
				backgroundColor: '#f3f5f6',
				foregroundColor: '#f3f5f6',
				foregroundBorderWidth: 20,
				textAdditionalCss: 'display:none;',
				halfCircle: true,
				animation: !$scope.allowEditKeywordSummary,
		        animationStep: 5,
		        backgroundBorderWidth: 20,
		        percent: 0,
			});
	  	},100);
	}

	$scope.getStarted = function() {
		$scope.toggleEditKeywordSummary();
		$scope.addSummaryKeyword();
	}

	$scope.removeSummaryKeyword = function(keywordIndex) {
		$scope.editableHomeKeywords.splice(keywordIndex, 1);
		$scope.homeKeywords.splice(keywordIndex, 1);
	};

	$scope.saveKeywordSummary = function(keywords) {
		var keywordList = [];
		for(var i=0; i<keywords.length; i++) {
			keywordList.push(keywords[i].title);
		}
		Homepage.updateKeywordSummary(keywordList, $scope.homepageID,
		  function(result){
		  	if(result.error) {
		  		$scope.homeLoading = false;
				$scope.toggleAlert('danger', true, result.message);
		  	} else {
		  		// If save was successful, reload the page
		  		$scope.allowEditKeywordSummary = false;
		  		$scope.homeLoading = true;
				$scope.loadHomepage();
		  	}
		  },
		  function() {
		  	$scope.clearAlerts();
		  	$scope.showHomepageGauges();
			$scope.toggleAlert('danger', true, 'Unknown error trying to update homepage keywords');
		  }
		);

	}

	$scope.loadHomepage = function() {
		$scope.homeLoading = true;
		Homepage.getHomepage($scope.inboxID,
		  function(result){

		  	$scope.homeKeywords = result.keywordData;
		  	$scope.homepageID = result.homepageID;
			$scope.homeLoading = false;
		  },
		  function() {
		  	$scope.homeLoading = false;
		  	log.error('Something bad happened getting homepage keywords');
		  }
		);
	};

	$scope.loadKeywordChart = function(keyword, keywordIndex) {
		Homepage.classifyKeyword($scope.inboxID, keyword,
		  function(result){
		  	var chartID = '#keyword_' + keywordIndex + '_gauge';
		  	$scope.showChart(chartID, result);
		  	log.info('Classification for ' + keyword + ': ' + result);
		  },
		  function() {
		  	$scope.homeLoading = false;
		  	log.error('Something bad happened getting classification');
		  }
		);


	


	};

	$scope.showChart = function(chartID, value) {
  		// Prep the chart
		$(chartID).empty();

  		// Determine the gauge color
		var backgroundColor = '';
		if($scope.allowEditKeywordSummary) {
			backgroundColor = '#a1a9ac';
		} else if(value < 33) {
			backgroundColor = '#d9534f';
		} else if(value >= 33 && value < 50) {
			backgroundColor = '#f0ad4e';
		}else if(value >= 50) {
			backgroundColor = '#5cb85c';
		}

		// Show the chart
		$(chartID).circliful({
			backgroundColor: '#f3f5f6',
			foregroundColor: backgroundColor,
			foregroundBorderWidth: 20,
			textAdditionalCss: 'display:none;',
			halfCircle: true,
			animation: !$scope.allowEditKeywordSummary,
	        animationStep: 5,
	        backgroundBorderWidth: 20,
	        percent: value,
		});
	}

	$scope.initHomeController = function() {
		if(!$scope.ensureAuthenticated) {
			$scope.changeView('login');
			return;
		}

	    var currentURL = $location.url();
	    if(currentURL.indexOf('home') > 0) {
	    	var selectedInbox = currentURL.slice(6,currentURL.length);
	    	if(selectedInbox) {
	    		$scope.inboxID = selectedInbox
	    	}
	    }
	    $scope.loadHomepage();
	};

	$scope.initHomeController();

}