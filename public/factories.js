function Entry($http) {
  var Entry = {};

  Entry.new = function (newEntry, onSuccess, onFail) {
    $http({ url: '/newEntry', method: 'POST', data: { newEntry: newEntry } })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        log.error('createEntry: Fail');
        onFail();
      }
    );
  };

  return Entry;
}
