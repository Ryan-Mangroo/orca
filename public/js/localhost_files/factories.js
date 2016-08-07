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
  Message.getOne = function(messageNumber, onSuccess, onFail) {
    $http({ url: '/getOneMessage', method: 'GET', params: { messageNumber: messageNumber } })
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
  Homepage.getKeywords = function(onSuccess, onFail) {
    $http({ url: '/getHomeKeywords', method: 'GET', params: {} })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        log.error('Homepage.getKeywords: Fail');
        onFail();
      }
    );
  };

  return Homepage;
}