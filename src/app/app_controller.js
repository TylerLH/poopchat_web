(function() {
  'use strict';
  /**
  * AppController
  *
  * Chat app controller
  */
  function AppController ($rootScope, $scope, localStorageService, $window) {
    var username = localStorageService.get('username');
    if (username) {
      $rootScope.username = username;
    }

    $scope.setUsername = function setUsername() {
      var username = $window.prompt('What would you like your username to be?');
      if (username) {
        $rootScope.username = username;
        localStorageService.set('username', username);
      }
    };
  }

  angular.module('poopchat')
    .controller('AppController', ['$rootScope', '$scope', 'localStorageService', '$window', AppController]);

})();