function homeController($scope, $location, $route, Homepage) {
	log.info('|homeController|');
	$scope.homeLoading = true;

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
		$scope.showGauges();
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
		  		$scope.clearAlerts();
				$scope.toggleAlert('danger', true, result.message);
		  	} else {
		  		// If save was successful, reload the page
		  		$route.reload();
		  	}
		  },
		  function() {
		  	$scope.clearAlerts();
		  	$scope.showGauges();
			$scope.toggleAlert('danger', true, 'Unknown error trying to update homepage keywords');
		  }
		);

	}

	$scope.loadHomeKeywords = function() {
		Homepage.getKeywordSummary(
		  function(result){

		  	$scope.homeKeywords = result.keywordData;
		  	$scope.homepageID = result.homepageID;
			
			setTimeout(function(){
			  	$scope.showGauges();
			  	log.info('Loaded');
		  	},100);
			$scope.homeLoading = false;
		  },
		  function() {
		  	$scope.homeLoading = false;
		  	log.error('Something bad happened getting homepage keywords');
		  }
		);
	};

	$scope.showGauges = function() {
	  	for(var i=0; i<$scope.homeKeywords.length; i++) {
	  		// Grab variables & prep the chart
	  		var keywordLink = '<a href="#">' + $scope.homeKeywords[i].title + '</a>';
	  		var value = $scope.homeKeywords[i].value + 20;
	  		var elementID = '#keyword_' + i + '_gauge';
			$(elementID).empty();

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
			$(elementID).circliful({
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
	};


	$scope.initHomeController = function() {
		$scope.loadHomeKeywords();
	};

	$scope.initHomeController();

}