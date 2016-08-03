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

  Entry.getAll = function(params, onSuccess, onFail) {
    $http({ url: '/getAllEntries', method: 'GET', params: params } )
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        log.error('getEntries: Fail');
        onFail();
      }
    );
  };

  Entry.getOne = function(entryNumber, onSuccess, onFail) {
    log.info('| Entry.getOne |');
    $http({ url: '/getOneEntry', method: 'GET', params: { entryNumber: entryNumber } })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        log.error('getOneEntry: Fail');
        onFail();
      }
    );
  };

  Entry.update = function (entryID, updatedEntry, onSuccess, onFail) {
    log.info('|Entry.update|');
    $http({ url: '/updateEntry', method: 'POST', data: { entryID: entryID, updatedEntry: updatedEntry } })
      .then(function success(response) {
        onSuccess(response.data.entry);
      },
      function fail(response) {
        log.error('updateEntry: Fail');
        onFail();
      }
    );
  };

  Entry.delete = function (entryIDs, onSuccess, onFail) {
    log.info('|Entry.delete|');
    $http({ url: '/deleteEntries', method: 'POST', data: { entryIDs: entryIDs } })
      .then(function success(response) {
        onSuccess(response.data);
      },
      function fail(response) {
        log.error('deleteEntries: Fail');
        onFail();
      }
    );
  };

  Entry.find = function(params, onSuccess, onFail) {
    log.info('|Entry.find|');
    $http({ url: '/searchEntries', method: 'GET', params: params })
      .then(function success(response) {
        log.info('Success');
        onSuccess(response.data.entries);
      },
      function fail(response) {
        log.error('searchEntries: Fail');
        onFail();
      }
    );
  };

  return Entry;
}


function User($http) {
  var User = {};
  
  User.login = function (credentials, onSuccess, onFail) {
    log.info('| User.login |');
    $http({ url: '/login', method: 'POST', data: { credentials: credentials } })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        log.error('User.login: Fail');
        onFail();
      }
    );
  };

  User.getProfile = function(onSuccess, onFail) {
    log.info('| User.getProfile |');
    onSuccess(null);
    //onSuccess({ firstname: 'Jesse', lastname: 'Williams' });
    return;


    $http({ url: '/getUserProfile', method: 'GET', params: {} })
      .then(function success(response) {
        onSuccess(response.data.result);
      },
      function fail(response) {
        log.error('User.getUserProfile: Fail');
        onFail();
      }
    );
  };

  return User;
}
