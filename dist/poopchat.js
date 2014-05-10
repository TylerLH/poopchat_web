(function(module) {
try {
  module = angular.module('poopchat-templates');
} catch (e) {
  module = angular.module('poopchat-templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/poopchat/chat/chat.html',
    '<div class="messages-container" autoscroller=""><div class="message" ng-repeat="message in messages"><strong>{{message.user || \'anonymous\'}} &raquo;</strong> {{message.content}}</div></div><form ng-submit="sendMessage()" class="message-form"><input class="message-input" ng-model="message.content" placeholder="Talk to fellow poopers..." required autofocus><button type="submit" class="btn-send">Send</button></form>');
}]);
})();

angular.module('poopchat', [
  'ui.router',
  'ngAnimate',
  'duScroll',
  'LocalStorageModule',
  'poopchat-templates'
]);

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
(function() {
  'use strict';

  angular.module('poopchat')
    .directive('autoscroller', [function(){
      // Runs during compile
      return {
        // name: '',
        // priority: 1,
        // terminal: true,
        //scope: { messages: '=messages' }, // {} = isolate, true = child, false/undefined = no change
        // controller: function($scope, $element, $attrs, $transclude) {},
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
        // template: '',
        // templateUrl: '',
        // replace: true,
        //transclude: true,
        link: function($scope, element, iAttrs, controller) {
          $scope.$watchCollection('messages', function(msgs, oldMsgs) {
            element.scrollTo(0, element[0].scrollHeight);
          });
        }
      };
    }]);
})();
(function() {
  'use strict';
  /**
  * ChatController
  *
  * Chat controller
  */
  function ChatController ($scope, $log, socket) {
    $scope.messages = [];
    $scope.message = {};

    socket.stream.onmessage = function(msg) {
      var data = JSON.parse(msg);
      $scope.messages.push(data);
      $scope.$digest();
    };

    // Message-sending success callback
    var onMessageSent = function() {
      $scope.message = {};
    };
    
    // Message-sending failure callback
    var onMessageFailed = function(err) {
      $scope.messages.push({content: 'There was a problem sending your message. Try again...'});
    };

    // Send message to server
    $scope.sendMessage = function() {
      if(!socket.connected){
        $scope.messages.push({content: "You're not connected!"});
      } else {
        if ($scope.username) {
          $scope.message.user = $scope.username;
        }
        socket.sendMessage($scope.message, onMessageSent, onMessageFailed);
      }
    }
  }

  angular.module('poopchat')
    .controller('ChatController', ['$scope', '$log', 'socket', ChatController]);

})();
(function(){
  'use strict';

  // Expose PushStream as a service
  angular.module('poopchat')
    .service('PushStream', ['$window', function($window){
      return $window.PushStream;
    }]);

  angular.module('poopchat')
    .factory('socket', ['$rootScope', 'PushStream', function($rootScope, PushStream){

      var socket = {
        connecting: false,
        connected: false
      };

      // Create the PushStream instance
      socket.stream = new PushStream({
        host: 'chat.poopchat.me',
        modes: 'websocket|stream|longpolling'
      });

      socket.sendMessage = function(msg, success, error) {
        this.stream.sendMessage(JSON.stringify(msg), success, error);
      };

      // Listen to status changes & manage connection state
      socket.stream.onstatuschange = function socketStatusChanged (status) {
        switch (status) {
          case PushStream.CONNECTING:
            socket.connecting = true;
            break;
          case PushStream.OPEN:
            socket.connected = true;
            break;
          case PushStream.CLOSED:
            socket.connected = false;
            break;
          default:
            break;
        }
      };

      // Add a channel & connect
      socket.stream.addChannel('global');
      socket.stream.connect();

      return socket;
    }]);
})();
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