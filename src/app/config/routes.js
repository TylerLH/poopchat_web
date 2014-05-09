(function(){
  'use strict';

  angular.module('poopchat')
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 
      function($stateProvider, $urlRouterProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise('/');

        $stateProvider
          .state('chat', {
            url: '/',
            templateUrl: '/poopchat/chat/chat.html',
            controller: 'ChatController'
          });
    }]);
})();