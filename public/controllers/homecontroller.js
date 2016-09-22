function homeController($scope, $location, $route, Homepage) {
	log.info('|homeController|');
	$scope.homeLoading = true;

	// Assume primary inbox by default (will be used if no inbox is passed in URL)
	$scope.inboxID = $scope.currentUser.account._primary_inbox._id
	$scope.homepageID = null;
	$scope.homeKeywords = [];
	$scope.newKeywordForm = {};

	$scope.saveNewKeyword = function(keyword) {
		$scope.homeKeywords.push({ title: keyword, value: 0 });
		log.info('Saving keyword');

		Homepage.saveKeyword(keyword, $scope.homepageID,
			function(result){
				$("#addKeywordModal").modal('hide');
				$scope.newKeywordForm = {};
		  		log.info('Saving keyword SUCCESS');
			},
			function() {
				$("#tokenResetModal").modal('hide');
				log.info('Saving keyword FAIL');
			}
		);
	};
	$scope.removeKeyword = function(keywordIndex) {
		log.info('Removing keyword: ' + keywordIndex);
		$('#keyword_' + keywordIndex + '_gauge_overlay').show();
		Homepage.removeKeyword(keywordIndex, $scope.homepageID,
			function(result){
		  		$('#keyword_' + keywordIndex + '_gauge_overlay').hide();
		  		$scope.homeKeywords.splice(keywordIndex, 1);
			},
			function() {
				log.info('Removing keyword FAIL');
			}
		);
		
	};

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
			backgroundColor: '#e4e9eb',
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