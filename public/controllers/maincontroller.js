function mainController($scope, $location) {
	log.info('|mainController|');

	$scope.pageTitleIcon = '';
	$scope.pageTitleText = '';

	$scope.startingPoints = {
		angry: 0,
		sad: 25,
		neutral: 50,
		happy: 75,
		excited: 100
	}

	$scope.moodData = {
		angry: 0,
		sad: 95,
		neutral: 0,
		happy: 0,
		excited: 5
	};

	$scope.generate = function(moodData) {

		$('#one31').css('opacity', '1');
		$('#two31').css('opacity', '1');
		$('#three31').css('opacity', '1');
		$('#four31').css('opacity', '1');
		$('#five31').css('opacity', '1');
		$('#six31').css('opacity', '1');
		$('#seven31').css('opacity', '1');

		/*
		$('.arrowUp').css('opacity', '0');

		// Use the very middle as the starting point.
		var markPoint = 50;

		markPoint -= (moodData.sad / 4);
		markPoint -= (moodData.angry / 2);		
		markPoint += (moodData.happy / 4);
		markPoint += (moodData.excited / 2);

		markPoint = parseInt(markPoint, 10);

		log.info('Final point: ' + markPoint);

		$('#' + markPoint).css('opacity', '1');

		if(markPoint > 75) {
			$('#' + markPoint).css('left', '-5px');
		} else {
			$('#' + markPoint).css('left', '-6px');
		}

		*/
	};

	$scope.changeView = function(viewName) {
    	$location.path(viewName);
  	};


  	$scope.createArray = function(count) {
  		var array = [];
  		for(var i=0; i<=count; i++) {
  			array.push(i);
  		}
  		return array;
  	};

	$scope.currentUser = {
		firstName: 'Jesse',
		lastName: 'Williams',
		companyName: 'Twitter',
		companyLogoURL: 'https://g.twimg.com/Twitter_logo_blue.png',
		companyFormURL: 'localhost:8080/box'
	};

	$scope.setPageTitle = function(title, iconClass) {
		$scope.pageTitleText = title;
		$scope.pageTitleIcon = iconClass;
	}

}