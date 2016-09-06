/* ######################### MESSAGE ######################### */
function Message($http) {
  var Message = {};
  Message.search = function(queryParams, onSuccess, onFail) {
    $http({ url: '/searchMessages', method: 'GET', params: queryParams } )
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        log.error('Message.getAllMessages: Fail');
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
        log.error('Message.getOne: Fail');
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
        log.error('Message.delete: Fail');
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
        log.error('Message.addComment: Fail');
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
        log.error('User.getUserProfile: Fail');
        onFail();
      }
    );
  };
  return User;
}


/* ######################### HOMEPAGE ######################### */
function Homepage($http) {
  var Homepage = {};
  Homepage.getKeywordSummary = function(onSuccess, onFail) {
    $http({ url: '/getKeywordSummary', method: 'GET', params: {} })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        log.error('Homepage.getKeywordSummary: Fail');
        onFail();
      }
    );
  };

  Homepage.updateKeywordSummary = function(keywordList, homepageID, onSuccess, onFail) {
    $http({ url: '/updateKeywordSummary', method: 'POST', data: { keywordList: keywordList, homepageID: homepageID } })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        log.error('Homepage.updateKeywordSummary: Fail');
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
        log.error('Account.updateCompany: Fail');
        onFail();
      }
    );
  };

  Account.updateUser = function (updatedUserInfo, onSuccess, onFail) {
    $http({ url: '/updateUser', method: 'POST', data: updatedUserInfo })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        log.error('Account.updateUser: Fail');
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
        log.error('Account.changePassword: Fail');
        onFail();
      }
    );
  };

  Account.getSignedLogoURL = function(fileName, fileType, onSuccess, onFail) {
    $http({ url: '/getSignedLogoURL', method: 'GET', params: { fileName: fileName, fileType: fileType } })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        log.error('Account.getSignedLogoURL: Fail');
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
        log.error('Account.signup: Fail');
        onFail();
      }
    );
  };

  return Account;
}


/* ######################### INBOX ######################### */
function Inbox($http) {
  var Inbox = {};
  Inbox.resetToken = function(inboxID, onSuccess, onFail) {
    $http({ url: '/resetInboxToken', method: 'POST', data: { inboxID: inboxID } })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        log.error('Inbox.resetToken: Fail');
        onFail();
      }
    );
  };

  return Inbox;
}
