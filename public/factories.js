/* ######################### MESSAGE ######################### */
function Message($http) {
  var Message = {};
  Message.search = function(queryParams, onSuccess, onFail) {
    $http({ url: '/searchMessages', method: 'GET', params: queryParams } )
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('Message.getAllMessages: Fail');
        onFail();
      }
    );
  };
  Message.getOne = function(messageID, onSuccess, onFail) {
    $http({ url: '/getOneMessage', method: 'GET', params: { messageID: messageID } })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('Message.getOne: Fail');
        onFail();
      }
    );
  };
  Message.delete = function (messageIDs, onSuccess, onFail) {
    $http({ url: '/deleteMessages', method: 'POST', data: { messages: messageIDs } })
      .then(function success(response) {
        onSuccess(response.data);
      },
      function fail(response) {
        //log.error('Message.delete: Fail');
        onFail();
      }
    );
  };
  Message.addComment = function (messageID, commentText, onSuccess, onFail) {
    $http({ url: '/addComment', method: 'POST', data: { messageID: messageID, commentText: commentText } })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('Message.addComment: Fail');
        onFail();
      }
    );
  };

  return Message;
}


/* ######################### USER ######################### */
function User($http) {
  var User = {};
  
  User.login = function (credentials, onSuccess, onFail) {
    $http.defaults.headers.common.Authorization = 'Basic ' + window.btoa(credentials.emailAddress + ':' + credentials.password);
    $http({ url: '/login', method: 'POST', withCredentials: true})
      .then(function success(response) {
        var user = response.data;
        onSuccess(user);
      },
      function fail(response){
        onFail();
      }
    );
  };

  User.getProfile = function(onSuccess, onFail) {
    $http({ url: '/getUserProfile', method: 'GET', params: {} })
      .then(function success(response) {
        onSuccess(response.data);
      },
      function fail(response) {
        //log.error('User.getUserProfile: Fail');
        onFail();
      }
    );
  };

  User.getOneUserInfo = function(userID, onSuccess, onFail) {
    $http({ url: '/getOneUserInfo', method: 'GET', params: { userID: userID } })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('User.getOneUserInfo: Fail');
        onFail();
      }
    );
  };

  User.update = function (updatedUserInfo, onSuccess, onFail) {
    $http({ url: '/updateUser', method: 'POST', data: updatedUserInfo })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('User.update: Fail');
        onFail();
      }
    );
  };

  User.delete = function (userID, onSuccess, onFail) {
    $http({ url: '/deleteUser', method: 'POST', data: { userID: userID } })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('User.delete: Fail');
        onFail();
      }
    );
  };

  User.requestPasswordReset = function(emailAddress, onSuccess, onFail) {
    $http({ url: '/requestPasswordReset', method: 'POST', data: { emailAddress: emailAddress } })
      .then(function success(response) {
        onSuccess(response.data);
      },
      function fail(response) {
        //log.error('User.requestPasswordReset: Fail');
        onFail();
      }
    );
  };

  User.resetPassword = function(password, token, onSuccess, onFail) {
    $http({ url: '/resetPassword', method: 'POST', data: { password: password, token: token } })
      .then(function success(response) {
        onSuccess(response.data);
      },
      function fail(response) {
        //log.error('User.resetPassword: Fail');
        onFail();
      }
    );
  };

  return User;
}


/* ######################### HOMEPAGE ######################### */
function Homepage($http) {
  var Homepage = {};
  Homepage.getHomepage = function(inboxID, onSuccess, onFail) {
    $http({ url: '/getHomepage', method: 'GET', params: { inboxID: inboxID} })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('Homepage.getKeywordSummary: Fail');
        onFail();
      }
    );
  };

  Homepage.classifyKeyword = function(inboxID, keyword, onSuccess, onFail) {
    $http({ url: '/classifyKeyword', method: 'GET', params: { inboxID: inboxID, keyword: keyword } })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('Homepage.classifyKeyword: Fail');
        onFail();
      }
    );
  };

  Homepage.saveKeyword = function(keyword, homepageID, onSuccess, onFail) {
    $http({ url: '/saveHomepageKeyword', method: 'POST', data: { keyword: keyword, homepageID: homepageID } })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('Homepage.saveKeyword: Fail');
        onFail();
      }
    );
  };

  Homepage.removeKeyword = function(keywordIndex, homepageID, onSuccess, onFail) {
    $http({ url: '/removeHomepageKeyword', method: 'POST', data: { keywordIndex: keywordIndex, homepageID: homepageID } })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('Homepage.removeKeyword: Fail');
        onFail();
      }
    );
  };

  return Homepage;
}


/* ######################### ACCOUNT ######################### */
function Account($http) {
  var Account = {};

  Account.updateCompany = function (updatedCompanyInfo, onSuccess, onFail) {
    $http({ url: '/updateAccount', method: 'POST', data: updatedCompanyInfo })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('Account.updateCompany: Fail');
        onFail();
      }
    );
  };

  Account.createUser = function (newUserInfo, onSuccess, onFail) {
    $http({ url: '/createUser', method: 'POST', data: newUserInfo })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('Account.createUser: Fail');
        onFail();
      }
    );
  };

  Account.updateCurrentUser = function (updatedUserInfo, onSuccess, onFail) {
    $http({ url: '/updateCurrentUser', method: 'POST', data: updatedUserInfo })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('Account.updateUser: Fail');
        onFail();
      }
    );
  };

  Account.changeUserPassword = function (passwordInfo, onSuccess, onFail) {
    $http({ url: '/changeUserPassword', method: 'POST', data: passwordInfo })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('Account.changePassword: Fail');
        onFail();
      }
    );
  };

  Account.getSignedLogoURL = function(fileName, fileType, onSuccess, onFail) {
    $http({ url: '/getSignedAccountLogoURL', method: 'GET', params: { fileName: fileName, fileType: fileType } })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('Account.getSignedLogoURL: Fail');
        onFail();
      }
    );
  };

  Account.saveLogoToS3 = function(signedRequest, imageFile, onSuccess, onFail) {
    var uploadRequest = new XMLHttpRequest();
    uploadRequest.open('PUT', signedRequest);
    uploadRequest.onreadystatechange = () => {
      if(uploadRequest.readyState === 4){
        if(uploadRequest.status === 200){
          onSuccess();
        }
        else{
          onFail();
        }
      }
    };
    uploadRequest.send(imageFile);
  };

  Account.signup = function (newAccountInfo, onSuccess, onFail) {
    $http({ url: '/signup', method: 'POST', data: newAccountInfo })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('Account.signup: Fail');
        onFail();
      }
    );
  };

  Account.getUsers = function(onSuccess, onFail) {
    $http({ url: '/getUsers', method: 'GET', params: {} })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        log.error('Account.getUsers: Fail');
        onFail();
      }
    );
  };

  return Account;
}


/* ######################### INBOX ######################### */
function Inbox($http) {
  var Inbox = {};

  Inbox.create = function (newInbox, onSuccess, onFail) {
    $http({ url: '/createInbox', method: 'POST', data: newInbox })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('Inbox.create: Fail');
        onFail();
      }
    );
  };

  Inbox.update = function (updatedInbox, onSuccess, onFail) {
    $http({ url: '/updateInbox', method: 'POST', data: updatedInbox })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('Inbox.update: Fail');
        onFail();
      }
    );
  };

  Inbox.delete = function (inboxIDs, onSuccess, onFail) {
    $http({ url: '/deleteInboxes', method: 'POST', data: { inboxIDs: inboxIDs } })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('Inbox.delete: Fail');
        onFail();
      }
    );
  };

  Inbox.resetToken = function(inboxID, onSuccess, onFail) {
    $http({ url: '/resetInboxToken', method: 'POST', data: { inboxID: inboxID } })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('Inbox.resetToken: Fail');
        onFail();
      }
    );
  };

  Inbox.toggleStatus = function(inboxID, status, onSuccess, onFail) {
    $http({ url: '/toggleInboxStatus', method: 'POST', data: { inboxID: inboxID, status: status } })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('Inbox.toggleStatus: Fail');
        onFail();
      }
    );
  };

  // Get and return all inbox info for the current user's account
  Inbox.getAllInboxInfo = function(onSuccess, onFail) {
    $http({ url: '/getAllInboxInfo', method: 'GET', params: {} })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('Inbox.getAllInboxes: Fail');
        onFail();
      }
    );
  };

  // Get and return inbox info for the given inbox ID
  Inbox.getOneInboxInfo = function(inboxID, onSuccess, onFail) {
    $http({ url: '/getOneInboxInfo', method: 'GET', params: { inboxID: inboxID } })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('Inbox.getOneInboxInfo: Fail');
        onFail();
      }
    );
  };

  Inbox.getSignedImageURL = function(inboxID, fileName, fileType, onSuccess, onFail) {
    $http({ url: '/getSignedInboxImageURL', method: 'GET', params: { inboxID: inboxID, fileName: fileName, fileType: fileType } })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        //log.error('Inbox.getSignedImageURL: Fail');
        onFail();
      }
    );
  };

  Inbox.saveImageToS3 = function(signedRequest, imageFile, onSuccess, onFail) {
    var uploadRequest = new XMLHttpRequest();
    uploadRequest.open('PUT', signedRequest);
    uploadRequest.onreadystatechange = () => {
      if(uploadRequest.readyState === 4){
        if(uploadRequest.status === 200){
          onSuccess();
        }
        else{
          onFail();
        }
      }
    };
    uploadRequest.send(imageFile);
  };


  return Inbox;
}
