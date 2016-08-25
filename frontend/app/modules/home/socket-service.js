(function() {
  angular
    .module('sysiphus.home')
    .service('SocketService', ['$rootScope', Service]);

  function Service($rootScope) {
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
            match.measurements = data;
            match.loading = false;
          });
        }
      });
    });
    return service;
  }
})();
