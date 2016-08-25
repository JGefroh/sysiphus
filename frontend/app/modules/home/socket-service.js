(function() {
  angular
    .module('sysiphus.home')
    .service('SocketService', ['$rootScope', '$filter', Service]);

  function Service($rootScope, $filter) {
    var service = this;
    service.projects = [];
    var socket = io();

    socket.on('projects:list', function(projects) {
      $rootScope.$applyAsync(function() {
        angular.forEach(projects, function(project) {
          service.projects.push(project);
          service.syncProject(project);
        })
      })
    });

    service.syncProject = function(project) {
      angular.forEach(project.servers, function(server) {
        server.loading = true;
        socket.emit('status:get', {id: server.id});
      });
    }

    socket.on('connect', function(data) {
      angular.forEach(service.projects, function(project) {
        service.syncProject(project);
      });
    });

    socket.on('status:get:result', function(data) {
      var match = null;
      angular.forEach(service.projects, function(project) {
        var match = null;
        angular.forEach(project.servers, function(server) {
          if (server.id === data.server_id) {
            match = server;
          }
        });
        if (match) {
          $rootScope.$applyAsync(function() {
            angular.extend(match, data);
            match.loading = false;
            project.lastUpdated = data.lastUpdated;
          });
        }
      });
    });

    socket.on('measurements:get:result', function(data) {
      if (!data || !data.length) {
        return;
      }
      angular.forEach(service.projects, function(project) {
        var match = null;
        angular.forEach(project.servers, function(server) {
          if (server.id === data[0].server_id) {
            match = server;
          }
        });
        if (match) {
          $rootScope.$applyAsync(function() {
            match.measurements = transformToChartJSCompatible(data);
            match.loading = false;
          });
        }
      });
    });

    function transformToChartJSCompatible(data) {
      var disk_used_in_bytes_data = [];
      var disk_used_in_bytes_labels = [];
      var cpu_idle_percentage_data = [];
      var cpu_idle_percentage_labels = [];
      var disk_total_in_bytes_data = [];
      angular.forEach(data, function(point, index) {
        disk_used_in_bytes_data.push((point.disk_used_in_bytes / 1000 / 1000 / 1000).toFixed(2));
        cpu_idle_percentage_data.push(100 - point.cpu_idle_percentage);
        disk_total_in_bytes_data.push((point.disk_total_in_bytes / 1000 / 1000 / 1000).toFixed(2));
        console.info(point.disk_total_in_bytes);
        if (index == data.length - 1) {
          disk_used_in_bytes_labels.push($filter('date')(new Date(point.created_at), 'MMM dd - HH:mm'));
          cpu_idle_percentage_labels.push($filter('date')(new Date(point.created_at), 'MMM dd - HH:mm'));
        }
        else {
          disk_used_in_bytes_labels.push($filter('date')(new Date(point.created_at), 'MMM dd'));
          cpu_idle_percentage_labels.push($filter('date')(new Date(point.created_at), 'MMM dd'));
        }
      });
      var results = {
        disk_used: {
          data: disk_used_in_bytes_data,
          labels: disk_used_in_bytes_labels
        },
        disk_total: {
          data: disk_total_in_bytes_data
        },
        cpu_idle: {
          data: cpu_idle_percentage_data,
          labels: cpu_idle_percentage_labels
        }
      };
      return results;
    }

    return service;
  }
})();
