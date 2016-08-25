(function() {
  'use strict';
  angular
    .module('sysiphus.home')
    .controller('HomeController', ['$scope', '$state', 'SocketService',Controller]);
  function Controller($scope, $state, SocketService) {
    var vm = this;
    vm.projects = SocketService.projects;
    vm.syncProject = SocketService.syncProject;
    vm.getChartOptions = function(server) {
      var max = Number(server.measurements.disk_total.data[server.measurements.disk_total.data.length - 1]);
      var stepSize = server.measurements.disk_total.data[server.measurements.disk_total.data.length - 1]  / 10;
      server.chartOptions = {
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
                labelString: 'Used Disk Space (GB)'
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
      console.info(server.chartOptions);
      return server.chartOptions;
    }
  }
}());
