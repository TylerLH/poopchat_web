(function (module) {
  try {
    module = angular.module('poopchat-templates');
  } catch (e) {
    module = angular.module('poopchat-templates', []);
  }
  module.run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('/poopchat/chat/chat.html', '<div class="messages-container" autoscroller=""><div class="message" ng-repeat="message in messages"><div><strong class="author">{{message.user || \'anonymous\'}}</strong> <small class="text-muted" am-time-ago="message.timestamp"></small></div><span ng-bind-html="message.content | image_linky:\'_blank\' | emoji"></span></div></div><form ng-submit="sendMessage()" class="message-form"><input class="message-input" ng-model="message.content" placeholder="Talk to fellow poopers..." required autofocus><button type="submit" class="btn-send">Send</button></form>');
    }
  ]);
}());
angular.module('poopchat', [
  'ui.router',
  'ngAnimate',
  'ngSanitize',
  'duScroll',
  'LocalStorageModule',
  'angularMoment',
  'emoji',
  'poopchat-templates'
]);
(function () {
  'use strict';
  /**
  * AppController
  *
  * Chat app controller
  */
  function AppController($rootScope, $scope, localStorageService, $window) {
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
  angular.module('poopchat').controller('AppController', [
    '$rootScope',
    '$scope',
    'localStorageService',
    '$window',
    AppController
  ]);
}());
(function () {
  'use strict';
  angular.module('poopchat').directive('autoscroller', [function () {
      // Runs during compile
      return {
        restrict: 'A',
        link: function ($scope, element, iAttrs, controller) {
          $scope.$watchCollection('messages', function (msgs, oldMsgs) {
            element.scrollTo(0, element[0].scrollHeight);
          });
        }
      };
    }]);
}());
(function () {
  'use strict';
  /**
  * ChatController
  *
  * Chat controller
  */
  function ChatController($scope, $log, socket) {
    $scope.messages = [];
    $scope.message = {};
    $scope.previousMessage = {};
    socket.stream.onmessage = function (msg) {
      var data = JSON.parse(msg);
      $scope.messages.push(data);
      $scope.$digest();
    };
    // Message-sending success callback
    var onMessageSent = function () {
      $scope.previousMessage = $scope.message;
      $scope.message = {};
    };
    // Message-sending failure callback
    var onMessageFailed = function (err) {
      $scope.messages.push({ content: 'There was a problem sending your message. Try again...' });
    };
    // Send message to server
    $scope.sendMessage = function () {
      if (!socket.connected) {
        $scope.messages.push({ content: 'You\'re not connected!' });
      } else {
        if ($scope.username) {
          $scope.message.user = $scope.username;
        }
        $scope.message.timestamp = new Date();
        socket.sendMessage($scope.message, onMessageSent, onMessageFailed);
      }
    };
  }
  angular.module('poopchat').controller('ChatController', [
    '$scope',
    '$log',
    'socket',
    ChatController
  ]);
}());
(function () {
  'use strict';
  // Expose PushStream as a service
  angular.module('poopchat').service('PushStream', [
    '$window',
    function ($window) {
      return $window.PushStream;
    }
  ]);
  angular.module('poopchat').factory('socket', [
    '$rootScope',
    'PushStream',
    function ($rootScope, PushStream) {
      var socket = {
          connecting: false,
          connected: false
        };
      // Create the PushStream instance
      socket.stream = new PushStream({
        host: 'chat.poopchat.me',
        modes: 'websocket|stream|longpolling'
      });
      socket.sendMessage = function (msg, success, error) {
        this.stream.sendMessage(JSON.stringify(msg), success, error);
      };
      // Listen to status changes & manage connection state
      socket.stream.onstatuschange = function socketStatusChanged(status) {
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
    }
  ]);
}());
(function () {
  'use strict';
  angular.module('poopchat').config([
    '$stateProvider',
    '$urlRouterProvider',
    '$locationProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider) {
      $locationProvider.html5Mode(true);
      $urlRouterProvider.otherwise('/');
      $stateProvider.state('chat', {
        url: '/',
        templateUrl: '/poopchat/chat/chat.html',
        controller: 'ChatController'
      });
    }
  ]);
}());
'use strict';
//transform image links to img tags and http links to a tags
//angular version: 1.2.6
//include ngSanitize
angular.module('poopchat').filter('image_linky', [
  '$sanitize',
  function ($sanitize) {
    var LINKY_URL_REGEXP = /((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>]/, MAILTO_REGEXP = /^mailto:/, IMAGE_REGEX = /(https?:\/\/.*\.(?:png|jpg|gif|jpeg)(\?\w*)?)/i;
    return function (text, target) {
      if (!text)
        return text;
      var match;
      var raw = text;
      var html = [];
      var url;
      var i;
      while (match = raw.match(IMAGE_REGEX)) {
        // We can not end in these as they are sometimes found at the end of the sentence
        url = match[0];
        i = match.index;
        addImage(url);
        raw = raw.substring(i + match[0].length);
      }
      while (match = raw.match(LINKY_URL_REGEXP)) {
        // We can not end in these as they are sometimes found at the end of the sentence
        url = match[0];
        // if we did not match ftp/http/mailto then assume mailto
        if (match[2] == match[3])
          url = 'mailto:' + url;
        i = match.index;
        addText(raw.substr(0, i));
        addLink(url, match[0].replace(MAILTO_REGEXP, ''));
        raw = raw.substring(i + match[0].length);
      }
      addText(raw);
      return $sanitize(html.join(''));
      function addText(text) {
        if (!text) {
          return;
        }
        html.push(text);
      }
      function addLink(url, text) {
        html.push('<a ');
        html.push('target="');
        html.push('_blank');
        html.push('" ');
        html.push('href="');
        html.push(url);
        html.push('">');
        addText(text);
        html.push('</a>');
      }
      function addImage(url) {
        html.push('<div class="image-container">');
        html.push('<a href="' + url + '" target="_blank"><img src="' + url + '" /></a>');
        html.push('</div>');
      }
    };
  }
]);