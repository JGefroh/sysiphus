(function() {
  angular
    .module('sysiphus.home')
    .service('SocketService', ['$rootScope', Service]);

  function Service($rootScope) {
    var service = this;
    service.projects = [
      {
        name: 'hnl.io',
        liveUrl: 'https://hnl.io',
        servers: [
          {
            name: 'Frontend',
            icon: 'fa-server',
            url: 'https://hnl.io',
            verification: 'hnl.io'
          },
          {
            name: 'Backend',
            icon: 'fa-server',
            url: 'https://api.hnl.io',
            verification: 'this was caused by a bug in the site'
          }
        ]
      },
      {
        name: 'ToDoList',
        sourceUrl: 'https://github.com/jgefroh/todolist',
        liveUrl: 'http://todolist.jgefroh.com',
        servers: [
          {
            name: 'Application',
            icon: 'fa-server',
            url: 'http://todolist.jgefroh.com',
            verification: 'ToDoList'
          }
        ]
      },
      {
        name: 'Chatterize',
        sourceUrl: 'https://github.com/jgefroh/chatterize',
        liveUrl: 'http://chatterize.jgefroh.com',
        servers: [
          {
            name: 'Application',
            icon: 'fa-server',
            url: 'http://chatterize.jgefroh.com',
            verification: 'Phoenix'
          }
        ]
      },
      {
        name: 'JGefroh.com',
        sourceUrl: 'https://github.com/jgefroh/JGefroh-website',
        liveUrl: 'http://jgefroh.com',
        servers: [
          {
            name: 'Website',
            icon: 'fa-desktop',
            url: 'http://jgefroh.com',
            verification: 'Caroline Paulic'
          }
        ]
      },
      {
        name: 'Aural',
        sourceUrl: 'https://github.com/jgefroh/aural',
        liveUrl: 'http://aural.jgefroh.com',
        servers: [
          {
            name: 'Website',
            icon: 'fa-desktop',
            url: 'http://aural.jgefroh.com',
            verification: 'aural'
          }
        ]
      },
      {
        name: 'Serenity',
        sourceUrl: 'https://github.com/jgefroh/serenity',
        liveUrl: 'http://serenity.jgefroh.com',
        servers: [
          {
            name: 'Website',
            icon: 'fa-desktop',
            url: 'http://serenity.jgefroh.com',
            verification: 'serenity'
          }
        ]
      },
      {
        name: 'Palette',
        sourceUrl: 'https://github.com/jgefroh/palette',
        liveUrl: 'http://palette.jgefroh.com',
        servers: [
          {
            name: 'Website',
            icon: 'fa-desktop',
            url: 'http://palette.jgefroh.com',
            verification: 'Palette'
          }
        ]
      }
    ];
    var socket = io();

    service.syncProject = function(project) {
      angular.forEach(project.servers, function(server) {
        server.loading = true;
        socket.emit('status:get', {url: server.url, verification: server.verification});
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
          if (server.url === data.url) {
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
    return service;
  }
})();
