(function() {
  'use strict';
  /**
  * AppController
  *
  * Chat app controller
  */
  function AppController ($rootScope, $scope, socket) {}

  angular.module('poopchat')
    .controller('AppController', ['$rootScope', '$scope', 'socket', AppController]);

})();