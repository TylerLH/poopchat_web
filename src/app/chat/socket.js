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