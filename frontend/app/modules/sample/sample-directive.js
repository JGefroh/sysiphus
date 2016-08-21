(function() {
  'use strict';
  angular
    .module('sysiphus.sample')
    .directive('sampleDirective', Directive);
  function Directive() {
    function Controller() {
      var vm = this;
    }

    return {
      restrict: 'EA',
      templateUrl: 'sample-directive.html',
      controller: [Controller],
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        name: '='
      }
    };
  }
})();
