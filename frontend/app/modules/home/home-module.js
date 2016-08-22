(function() {
  'use strict';
  angular
    .module('sysiphus.home', [])
    .config(['$stateProvider', Routes]);

    function Routes($stateProvider) {
      $stateProvider.state('sysiphus.home', {
          url: '/',
          templateUrl: 'home.html',
          controller: 'HomeController',
          controllerAs: 'vm'
      });
    }
})();
