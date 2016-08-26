(function() {
  'use strict';
  angular
    .module('sysiphus.home')
    .controller('HomeController', ['$scope', '$state', 'SocketService',Controller]);
  function Controller($scope, $state, SocketService) {
    var vm = this;
    vm.groups = SocketService.groups;
    vm.syncGroup = SocketService.syncGroup;
  }
}());
