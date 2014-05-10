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