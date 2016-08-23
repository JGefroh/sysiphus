const express = require("express");
const app = express();
const router = express.Router();
const exec = require('child_process').exec;

const port = process.env.PORT || 8080;
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const projects = require('./projects.json')
var http = require("http");
var https = require("https");


io.on('connection', function(client) {
  client.emit('projects:list', projects);
  client.on('status:get', function(fromClient) {
    if (!fromClient || !fromClient.id) {
      return;
    }

    var server = getServer(fromClient.id);
    if (!server) {
      sendFail(client, fromClient.id);
      return;
    }

    fetchServer(client, server);
    if (server.sysiphusUrl) {
      fetchSysiphus(client, server);
    }
  });
});

function fetchServer(client, server) {
  var protocol = server.url.indexOf('https:') === -1 ? http : https;
  var start = new Date();
  var request = protocol.get(server.url, function(response) {
    var data = '';
    var ip = parseIP(request); //[JG]: Not available if connection is closed.
    response.on('data', function(chunk) {
      data += chunk;
    });
    response.on('end', function() {
      var result = {
        id: server.id,
        lastUpdated: new Date(),
        timeTaken: parseTimeTaken(start),
        server: parseServer(response),
        up: data.indexOf('Could not resolve host') === -1,
        verified: data.indexOf(server.verification) !== -1,
        ip: ip
      };
      client.emit('status:get:result', result);
    })
  }, function() {
    sendFail(client, server.id);
  });
}

function fetchSysiphus(client, server) {
  var child = exec("curl " + server.sysiphusUrl);
  var data = '';
  child.stdout.on("data", function(curlResult) {
    data += curlResult;
  });
  child.on("close", function(curlResult) {
    var json = {};
    if (data.indexOf('sysiphus-status') !== -1) {
      json = JSON.parse(data);
    }
    var result = {
      id: server.id,
      disk_used_in_bytes: json.disk_used_in_bytes,
      disk_free_in_bytes: json.disk_free_in_bytes,
      disk_total_in_bytes: json.disk_total_in_bytes,
      lastUpdated: new Date()
    }
    client.emit('status:get:result', result);
  });
}

function sendFail(id) {
  var result = {
    id: id,
    lastUpdated: new Date(),
    up: false,
    verified: false
  };
  client.emit('status:get:result', result);
}

function getServer(id) {
  for (var i = 0; i < projects.length; i++) {
    var project = projects[i];
    for (var x = 0; x < project.servers.length; x++) {
      var server = project.servers[x];
      if (server.id === id) {
        return project.servers[x];
      }
    }
  }
}

function parseServer(response) {
  return response.headers.server;
}

function parseTimeTaken(start) {
  return new Date() - start;
}

function parseIP(request) {
  return request.connection.remoteAddress || request.socket.remoteAddress || request.connection.socket.remoteAddress;
}


app.use('/api', router);
router.get('/', (req, res) => {

});

app.use('/', express.static('public'));
app.get('/*', (req, res, next) => {
  //[JG]: Anguar routes are configured to not be hash prefixed.
  if (req.url.indexOf('/api') === 0) {
    next();
  }
  else if (req.url.indexOf('/socket/socket.io.js') !== -1) {
    next();
  }
  else {
    res.sendFile(__dirname + '/index.html');
  }
});

server.listen(port);
