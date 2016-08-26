(function() {
  'use strict';
  angular
    .module('sysiphus.home')
    .directive('server', [Directive]);
  function Directive() {
    function Controller($scope, $state, SocketService) {
      var vm = this;
    }
    return {
      restrict: 'A',
      templateUrl: 'server.html',
      controller: ['$scope', '$state', 'SocketService', Controller],
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        server: '='
      }
    }
  }
}());
