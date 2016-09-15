function inboxConfigController($scope, $location, Inbox) {
	log.info('|inboxConfigController|');

	$scope.selectedInbox = null;
	$scope.inboxImageFile = null;

	$scope.allowEditImage = false;
	$scope.inboxImageSource = null;

  	$scope.loadInboxInfo = function(inboxID) {
  		log.info('Loading inboxes');
  		Inbox.getOneInboxInfo(inboxID,
			function(inboxInfo){
				$scope.selectedInbox = inboxInfo;
				$scope.inboxImageSource = $scope.selectedInbox.image;
			},
			function() {
				log.error('Error loading inboxe');
			}
		);
  	};

	$scope.previewInboxImage = function(element) {
		$scope.allowEditImage = true;
		$scope.$apply(function(scope) {
			var imageFile = element.files[0];
			$scope.inboxImageFile = imageFile;
			var reader = new FileReader();
			reader.readAsDataURL(imageFile);
			reader.onload = function(e) {
				$scope.inboxImageSource = reader.result;
				$scope.$apply();
			};
		});
	};

	$scope.saveInboxImage = function() {

		// First, request the image URL from our server
		Inbox.getSignedImageURL($scope.selectedInbox._id, $scope.inboxImageFile.name, $scope.inboxImageFile.type, 
		  function(requestInfo){
		  	$scope.clearAlerts();
			$scope.saveInboxImageToS3(requestInfo, $scope.inboxImageFile);
		  },
		  function() {
		  	// On fail of getting signed request
		  	$scope.clearAlerts();
		  	$scope.toggleAlert('danger', true, 'Something failed while updating inbox image');
		  }
		);
	};

	$scope.saveInboxImageToS3 = function(requestInfo, imageFile) {
	  	// Then, send the file over to S3
		Inbox.saveImageToS3(requestInfo.signedRequest, imageFile,
		  function(){
		  	$scope.allowEditImage = false;
		  	$scope.clearAlerts();
		  	$scope.toggleAlert('success', true, 'Inbox image updated');
		  	$scope.$apply();
		  },
		  function() {
		  	$scope.allowEditImage = false;
		  	$scope.clearAlerts();
		  	$scope.toggleAlert('danger', true, 'Something failed while updating inbox image');
		  	$scope.$apply();
		  }
		);
	};

	$scope.cancelChangeImage = function() {
		$scope.setInboxImageSource($scope.selectedInbox.image);
		$scope.allowEditImage = false;
	};

	$scope.setInboxImageSource = function(src) {
		$scope.inboxImageSource = src;
	};


	$scope.initInboxConfigController = function() {
		if(!$scope.ensureAuthenticated) {
			$scope.changeView('login');
			return;
		}
	    var currentURL = $location.url();
	    var inboxID = currentURL.slice(22,currentURL.length);
		$scope.loadInboxInfo(inboxID);
	};

	$scope.initInboxConfigController();

}