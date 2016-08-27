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
          var newMeasurements = transformToChartJSCompatible(data.data);
          if (!match.measurements) {
            return match.measurements = newMeasurements;
          }
          else {
            combine(match.measurements, newMeasurements, 'cpu_idle');
            combine(match.measurements, newMeasurements, 'disk_used');
            combine(match.measurements, newMeasurements, 'disk_total');
            combine(match.measurements, newMeasurements, 'ram_used');
            combine(match.measurements, newMeasurements, 'ram_total');
          }
        });
      }
    });

    function combine(measurements, newMeasurements, type) {
      if (!measurements[type]) {
        measurements[type] = {
          data: [],
          labels: []
        };
      }
      angular.forEach(newMeasurements[type].data[0], function(point) {
        measurements[type].data[0].push(point);
      });
      angular.forEach(newMeasurements[type].labels, function(point) {
        measurements[type].labels.push(point);
      });
    }

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

    function processData(unformattedData, type, convert) {
      var data = [];
      var labels = [];
      convert = convert || function(input) {return input;};
      angular.forEach(unformattedData, function(point, index) {
        data.push(convert(point[type]));
        labels.push(point.created_at);
      });
      return {
        data: [data],
        labels: labels
      };
    }

    function transformToChartJSCompatible(data) {
      var disk_used = processData(data, 'disk_used_in_bytes', function(value) {
        return (value / 1000 / 1000 / 1000).toFixed(2)
      });
      var cpu_idle = processData(data, 'cpu_idle_percentage', function(value) {
        return (100 - value).toFixed(2);
      });
      var disk_total = processData(data, 'disk_total_in_bytes', function(value) {
        return (value / 1000 / 1000 / 1000).toFixed(2);
      });
      var ram_used = processData(data, 'ram_used_in_bytes', function(value) {
        return (value / 1000 / 1000 / 1000).toFixed(2);
      });
      var ram_total = processData(data, 'ram_total_in_bytes', function(value) {
        return (value / 1000 / 1000 / 1000).toFixed(2);
      });
      return {
        disk_used: disk_used,
        disk_total: disk_total,
        cpu_idle: cpu_idle,
        ram_used: ram_used,
        ram_total: ram_total
      };
    }

    return service;
  }
})();
