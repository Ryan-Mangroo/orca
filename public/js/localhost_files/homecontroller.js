function homeController($scope, $location, Homepage) {
	log.info('|homeController|');

	$scope.homeKeywords = [];

	$scope.moodScaleStyle = function(value){
		var backgroundColor = '';
		if(value < 25) {
			backgroundColor = '#d9534f';
		} else if(value >= 25 && value < 50) {
			backgroundColor = '#f0ad4e';
		} else if(value >= 50 && value < 75) {
			backgroundColor = '#A6B355';
		} else if(value >= 75) {
			backgroundColor = '#5cb85c';
		}
		var style = { 'width': String(value) + '%', 'background-color': backgroundColor };
		return style;
	}

	$scope.loadHomeKeywords = function() {
		Homepage.getKeywords(
		  function(keywordData){
		  	$scope.homeKeywords = keywordData;
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