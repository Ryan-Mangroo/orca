function editInboxController($scope, $location, Inbox) {
	$scope.clearAlerts();
	$scope.inboxLoading = true;
	$scope.inboxSubmitting = false;

	$scope.selectedInbox = {};
	$scope.inboxImageFile = null;

	$scope.allowEditImage = false;
	$scope.inboxImageSource = null;

  	$scope.loadInboxInfo = function(inboxID) {
  		Inbox.getOneInboxInfo(inboxID,
			function(inboxInfo){
				$scope.inboxLoading = false;
				$scope.selectedInbox = inboxInfo;
				$scope.inboxImageSource = $scope.selectedInbox.image;

				// Set the notification preference checkbox
				var watchers = $scope.selectedInbox._watchers;
				if(watchers.indexOf($scope.currentUser.id) >= 0) {
					$scope.selectedInbox.notify = true;
				} else {
					$scope.selectedInbox.notify = false;
				}

			},
			function() {
				window.location = 'http://www.workwoo.com/404.html';
			}
		);
  	};

  	$scope.saveInbox = function(selectedInbox) {
  		var watcherIndex = selectedInbox._watchers.indexOf($scope.currentUser.id);

  		// Before saving, save the notification preference
  		if(selectedInbox.notify && watcherIndex < 0) {
  			// If the user is not a watcher but is becoming one, add them to the list.
  			$scope.selectedInbox._watchers.push($scope.currentUser.id);
  		} else if(!selectedInbox.notify && watcherIndex >= 0) {
  			// If the user is a watcher but is being removed, remove them from the list.
  			if(selectedInbox._watchers.indexOf($scope.currentUser.id) >= 0) {
  				selectedInbox._watchers.splice(watcherIndex, 1);
  			}
  		}

  		$scope.inboxSubmitting = true;
		Inbox.update(selectedInbox, 
		  function(updatedInbox){
		  	$scope.selectedInbox = updatedInbox;

			// Set the notification preference checkbox
			var watchers = $scope.selectedInbox._watchers;
			if(watchers.indexOf($scope.currentUser.id) >= 0) {
				$scope.selectedInbox.notify = true;
			} else {
				$scope.selectedInbox.notify = false;
			}
		  	
		  	$scope.clearAlerts();
		  	$scope.inboxSubmitting = false;
		  	$scope.toggleAlert('success', true, 'Inbox updated');
		  },
		  function() {
		  	window.location = 'http://www.workwoo.com/404.html';
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
				window.location = 'http://www.workwoo.com/404.html';
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
		  	window.location = 'http://www.workwoo.com/404.html';
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
			window.location = 'http://www.workwoo.com/404.html';
		  }
		);
	};

	  $scope.deleteInbox = function() {
  		$scope.inboxSubmitting = true;
		Inbox.delete([$scope.selectedInbox._id],
			function(result){
				$('#deleteInboxModal').modal('hide');
			  	$scope.clearAlerts();
			  	$scope.inboxSubmitting = false;
			  	$scope.loadAllInboxInfo();
			  	$scope.toggleAlert('success', true, 'Inbox Deleted');
			  	$scope.changeView('settings');
			},
			function() {
				window.location = 'http://www.workwoo.com/404.html';
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
		$("#inactivateModal").modal('hide');
		$scope.inboxSubmitting = true;
		Inbox.toggleStatus($scope.selectedInbox._id, status,
			function(updatedInbox){
				$("#inactivateModal").modal('hide');
				$scope.selectedInbox.status = status;
				$scope.inboxSubmitting = false;
		  		$scope.clearAlerts();
		  		if(status == 'active') {
		  			$scope.toggleAlert('success', true, 'This Inbox is now active');
		  		} else {
		  			$scope.toggleAlert('success', true, 'This Inbox is now inactive');
		  		}
		  		
			},
			function() {
				window.location = 'http://www.workwoo.com/404.html';
			}
		);
	};


	$scope.initEditInboxController = function() {
		if(!$scope.ensureAuthenticated) {
			window.location = 'http://www.workwoo.com/#/login';
			return;
		}
	    var currentURL = $location.url();
	    var inboxID = currentURL.slice(21,currentURL.length);
		$scope.loadInboxInfo(inboxID);
	};

	$scope.initEditInboxController();

}