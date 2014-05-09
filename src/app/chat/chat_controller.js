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

    socket.stream.onmessage = function(text) {
      var data = JSON.parse(text);
      $scope.messages.push(data);
      $scope.$digest();
    };

    // Message-sending success callback
    var onMessageSent = function() {
      $scope.message = {};
    };
    
    // Message-sending failure callback
    var onMessageFailed = function(err) {
      $scope.messages.push({text: 'There was a problem sending your message. Try again...'});
    };

    // Send message to server
    $scope.sendMessage = function() {
      if(!socket.connected){
        $scope.messages.push({text: "You're not connected!"});
      } else {
        socket.sendMessage($scope.message, onMessageSent, onMessageFailed);
      }
    }
  }

  angular.module('poopchat')
    .controller('ChatController', ['$scope', '$log', 'socket', ChatController]);

})();