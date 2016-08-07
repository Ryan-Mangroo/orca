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


function Box($http) {
  var Box = {};
  Box.getInfo = function(boxNumber, token, onSuccess, onFail) {
    $http({ url: '/getBoxInfo', method: 'GET', params: { boxNumber: boxNumber, token: token } })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        log.error('Box.getInfo: Fail');
        onFail();
      }
    );
  };

  return Box;
}
