function editInboxController($scope, $location, Inbox) {
	log.info('|editInboxController|');
	$scope.clearAlerts();
	$scope.inboxLoading = true;
	$scope.inboxSubmitting = false;

	$scope.selectedInbox = null;
	$scope.inboxImageFile = null;

	$scope.allowEditImage = false;
	$scope.inboxImageSource = null;

  	$scope.loadInboxInfo = function(inboxID) {
  		Inbox.getOneInboxInfo(inboxID,
			function(inboxInfo){
				log.object(inboxInfo);
				$scope.inboxLoading = false;
				$scope.selectedInbox = inboxInfo;
				$scope.inboxImageSource = $scope.selectedInbox.image;
			},
			function() {
				$scope.inboxLoading = false;
				log.error('Error loading inbox');
			}
		);
  	};

  	$scope.saveInbox = function(selectedInbox) {
  		$scope.inboxSubmitting = true;
		Inbox.update(selectedInbox, 
		  function(updatedInbox){
		  	$scope.selectedInbox = updatedInbox;
		  	$scope.clearAlerts();
		  	$scope.inboxSubmitting = false;
		  	$scope.toggleAlert('success', true, 'Inbox updated');
		  },
		  function() {
		  	$scope.inboxSubmitting = false;
		  	$scope.clearAlerts();
		  	$scope.toggleAlert('danger', true, 'Inbox updat fail');
		  }
		);
	};

  	$scope.resetToken = function() {
  		$scope.inboxSubmitting = true;
		Inbox.resetToken($scope.selectedInbox._id, 
			function(updatedInbox){
				$("#tokenResetModal").modal('hide');
				$scope.selectedInbox.token = updatedInbox.token;
				$scope.inboxSubmitting = false;
		  		$scope.clearAlerts();
		  		$scope.toggleAlert('success', true, 'The link to your inbox has been reset. Be sure to share the new link.');
			},
			function() {
				$("#tokenResetModal").modal('hide');
				$scope.inboxSubmitting = false;
		  		$scope.clearAlerts();
		  		$scope.toggleAlert('danger', true, 'Something bad happened while reseting the inbox link');
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

	$scope.toggleInboxStatus = function(status) {
		$scope.selectedInbox.status = status;
	};


	$scope.initEditInboxController = function() {
		if(!$scope.ensureAuthenticated) {
			$scope.changeView('login');
			return;
		}
	    var currentURL = $location.url();
	    var inboxID = currentURL.slice(20,currentURL.length);

	    log.info(inboxID);

		$scope.loadInboxInfo(inboxID);
	};

	$scope.initEditInboxController();

}