(function() {
  'use strict';
  angular
    .module('sysiphus.home')
    .directive('application', [Directive]);
  function Directive() {
    function Controller($scope, $state, SocketService) {
      var vm = this;
    }
    return {
      restrict: 'A',
      templateUrl: 'application.html',
      controller: ['$scope', '$state', 'SocketService', Controller],
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        application: '='
      }
    }
  }
}());
