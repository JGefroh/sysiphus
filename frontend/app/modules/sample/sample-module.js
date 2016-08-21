(function() {
  'use strict';
  angular
    .module('sysiphus.sample', [])
    .config(['$stateProvider', Routes]);

    function Routes($stateProvider) {
      $stateProvider.state('sysiphus.sample', {
          url: '/',
          templateUrl: 'sample.html',
          controller: 'SampleController',
          controllerAs: 'vm'
      }).state('sysiphus.sample-2', {
          url: '/sample-2',
          templateUrl: 'sample-2.html',
          controller: 'SampleController',
          controllerAs: 'vm'
      });
    }
})();
