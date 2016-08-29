function homeController($scope, $location, $route, Homepage) {
	log.info('|homeController|');
	$scope.homepageID = null;
	$scope.homeKeywords = [];
	$scope.homeKeywordsOriginal = [];
	$scope.editableHomeKeywords = [];

	$scope.allowEditKeywordSummary = false;

	$scope.getMoodscaleColor = function(value){
		var value = value + 20;
		var backgroundColor = '';
		if($scope.allowEditKeywordSummary) {
			backgroundColor = '#d2d5da';
		} else if(value < 33) {
			backgroundColor = '#d16d5f';
		} else if(value >= 33 && value < 50) {
			backgroundColor = '#f0ad4e';
		}else if(value >= 50) {
			backgroundColor = '#5fd16d';
		}
		return backgroundColor;
	}

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
			$scope.setProgressBars();
			$scope.allowEditKeywordSummary = false;
		}
	};

	$scope.addSummaryKeyword = function() {
		var newKeyword = { title: 'New Word', value: 0 };
		$scope.editableHomeKeywords.push(newKeyword);
		$scope.homeKeywords.push(newKeyword);
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
			$scope.toggleAlert('danger', true, 'Unknown error trying to update homepage keywords');
		  }
		);

	}

	$scope.setProgressBars = function() {
		// The delay allows for NG to finish the scope changes before jQuery tries to animate
		setTimeout(function(){
		  	for(var i=0; i<$scope.homeKeywords.length; i++) {
		  		var value = $scope.homeKeywords[i].value + 20 + '%';
		  		log.info(i + ': ' + value);

		  		$('#' + i + '_keyword_bar').css('width', value);
		  	}
	  	},100);
	};

	$scope.loadHomeKeywords = function() {
		Homepage.getKeywordSummary(
		  function(result){

		  	$scope.homeKeywords = result.keywordData;
		  	$scope.homepageID = result.homepageID;
			$scope.setProgressBars();
		  },
		  function() {
		  	log.error('Something bad happened getting homepage keywords');
		  }
		);
	};

	$scope.initHomeController = function() {
		$scope.loadHomeKeywords();
	};

	$scope.initHomeController();

}