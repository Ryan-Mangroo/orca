/* ######################### MESSAGE ######################### */
function Message($http) {
  var Message = {};
  Message.getAll = function(params, onSuccess, onFail) {
    $http({ url: '/getAllMessages', method: 'GET', params: params } )
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

  return Account;
}
