(function() {
  angular
    .module('sysiphus.home')
    .service('SocketService', ['$rootScope', '$filter', Service]);

  function Service($rootScope, $filter) {
    var service = this;
    service.groups = [];
    var socket = io();

    socket.on('groups:list', function(groups) {
      service.groups.length = 0;
      $rootScope.$applyAsync(function() {
        angular.forEach(groups, function(group) {
          service.groups.push(group);
          service.syncGroup(group);
        })
      })
    });

    service.syncGroups = function() {
      $rootScope.$applyAsync(function() {
        angular.forEach(service.groups, function(group) {
          service.syncGroup(group);
        })
      })
    };


    service.syncGroup = function(group) {
      angular.forEach(group.servers, function(server) {
        socket.emit('get:status:server', {id: server.id});
        socket.emit('get:measurements:server', {id: server.id});
        angular.forEach(server.applications, function(application) {
          socket.emit('get:status:application', {id: application.id});
        })
      });
    }

    socket.on('connect', function(data) {
      angular.forEach(service.groups, function(group) {
        service.syncGroup(group);
      });
    });

    socket.on('get:status:server:update', function(data) {
      var match = getMatch(data.id, 'server');
      if (match) {
        $rootScope.$applyAsync(function() {
          angular.extend(match, data);
        });
      }
    });

    socket.on('get:status:application:update', function(data) {
      var match = getMatch(data.id, 'application');
      if (match) {
        $rootScope.$applyAsync(function() {
          angular.extend(match, data);
        });
      }
    });

    socket.on('get:measurements:server:update', function(data) {
      var match = getMatch(data.id, 'server');
      if (match) {
        $rootScope.$applyAsync(function() {
          match.measurements = transformToChartJSCompatible(data.data);
        });
      }
    });

    function getMatch(id, type) {
      var match = null;
      angular.forEach(service.groups, function(group) {
        if (type !== 'group') {
          angular.forEach(group.servers, function(server) {
            if (type !== 'server') {
              angular.forEach(server.applications, function(application) {
                if (application.id === id) {
                  match = application;
                }
              });
            }
            else if (server.id === id) {
              match = server;
            }
          });
        }
        else if (group.id === id) {
          match = group;
        }
      });
      return match;
    }

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
          data: [disk_used_in_bytes_data],
          labels: disk_used_in_bytes_labels
        },
        disk_total: {
          data: [disk_total_in_bytes_data]
        },
        cpu_idle: {
          data: [cpu_idle_percentage_data],
          labels: cpu_idle_percentage_labels
        }
      };
      return results;
    }

    return service;
  }
})();
