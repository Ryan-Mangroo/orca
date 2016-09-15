function Message($http) {
  var Message = {};

  Message.create = function (newMessage, onSuccess, onFail) {
    $http({ url: '/createMessage', method: 'POST', data: newMessage })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        log.error('Message.create: Fail');
        onFail();
      }
    );
  };

  return Message;
}


function Inbox($http) {
  var Inbox = {};
  Inbox.getInfo = function(inboxNumber, token, onSuccess, onFail) {
    $http({ url: '/getPublicInfo', method: 'GET', params: { inboxNumber: inboxNumber, token: token } })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        log.error('Inbox.getInfo: Fail');
        onFail();
      }
    );
  };

  return Inbox;
}
