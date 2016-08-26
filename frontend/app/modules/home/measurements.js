(function() {
  'use strict';
  angular
    .module('sysiphus.home')
    .directive('measurements', [Directive]);
  function Directive() {
    function Controller($scope, $state, SocketService) {
      var vm = this;

      vm.getChartOptions = function(server, chartFor) {
        var labelStringY;
        var max;
        var stepSize;
        if (chartFor === 'cpu_idle') {
          labelStringY = 'Used CPU (%)';
          max = 100;
          stepSize = 100  / 10;
        }
        else {
          labelStringY = 'Used Disk Space (GB)';
          max = Number(vm.measurements.disk_total.data[0][vm.measurements.disk_total.data.length - 1]);
          stepSize = vm.measurements.disk_total.data[0][vm.measurements.disk_total.data.length - 1]  / 10;
        }
        var chartOptions = {
          scales: {
            xAxes: [
              {
                scaleLabel: {
                  display: true,
                  labelString: 'Time'
                },
                display: true
              }
            ],
            yAxes: [
              {
                scaleLabel: {
                  display: true,
                  labelString: labelStringY
                },
                ticks: {
                  min: 0,
                  max: max,
                  stepSize: stepSize
                }
              }
            ]
          }
        }
        vm.chartOptions = vm.chartOptions || {};
        vm.chartOptions[chartFor] = chartOptions;
        return vm.chartOptions[chartFor];
      }
    }
    return {
      restrict: 'A',
      templateUrl: 'measurements.html',
      controller: ['$scope', '$state', 'SocketService', Controller],
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        measurements: '='
      }
    }
  }
}());
