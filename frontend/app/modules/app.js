(function () {
  'use strict';
   //[JG]: Vars filled in by build tool.
  var apiHost = '{!api_host!}';

  angular
    .module('sysiphus',
    [
        'ui.router',
        'sysiphus.home',
        'chart.js'
    ])
    .constant('baseImagePath', '/images/')
    .constant('config', {apiHost: apiHost})
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
      $urlRouterProvider.otherwise('/');
      $locationProvider.html5Mode(true);
      $stateProvider.state('sysiphus', {
          url: '',
          templateUrl: 'standard-layout.html',
      })
      .state('sysiphus-home_if_no_slash', { //[JG] Fixes blank screen when refreshing on home page
          url: '/',
          templateUrl: 'standard-layout.html'
      });
    }])
    .controller('ApplicationController', ['$rootScope', '$state', '$anchorScroll', ApplicationController]);

    function ApplicationController($rootScope, $state, $anchorScroll) {
      var vm = this;
    }
})();
