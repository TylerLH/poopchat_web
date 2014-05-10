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
        $scope.message.timestamp = new Date();
        socket.sendMessage($scope.message, onMessageSent, onMessageFailed);
      }
    }
  }

  angular.module('poopchat')
    .controller('ChatController', ['$scope', '$log', 'socket', ChatController]);

})();