const express = require("express");
const bodyParser = require('body-parser')
const app = express();
const router = express.Router();
const exec = require('child_process').exec;
const knex = require('knex')(require('./knexfile')[process.env.NODE_ENV || 'development']);


const port = process.env.PORT || 8080;
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const groups = require('./groups.json')
var http = require("http");
var https = require("https");

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


io.on('connection', function(client) {
  client.emit('groups:list', groups);

  client.on('get:status:application', function(socketData) {
    var application = getObject(socketData.id, 'application');
    if (!application) {
      return;
    }
    fetchApplication(client, application);
  });

  client.on('get:status:server', function(socketData) {
    var server = getObject(socketData.id, 'server');
    if (!server) {
      return;
    }
    fetchServer(client, server);
  });

  client.on('get:measurements:server', function(socketData) {
    var server = getObject(socketData.id, 'server');
    if (!server) {
      return;
    }
    fetchMeasurements(client, server);
  })
});

function fetchServer(client, server) {
  var start = new Date();
  var request = getProtocol(server.url).get(server.url, function(response) {
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
      client.emit('get:status:server:update', result);
    })
  });
}

function fetchApplication(client, application) {
  var request = getProtocol(application.url).get(application.url, function(response) {
    var data = '';
    response.on('data', function(chunk) {
      data += chunk;
    });
    response.on('end', function() {
      var result = {
        id: application.id,
        lastUpdated: new Date(),
        up: data.indexOf('Could not resolve host') === -1,
        verified: data.indexOf(application.verification) !== -1
      };
      client.emit('get:status:application:update', result);
    });
  }, function() {
    sendFail(client, application.id);
  });
}

function fetchMeasurements(client, server) {
  var data = [];
  knex('measurements').where({
    server_id: server.id
  }).orderBy('created_at', 'desc').limit(300).map(function(row) {
    data.push(row);
  }).then(function() {
    if (data.length) {
      client.emit('get:measurements:server:update', {id: server.id, data: data});
    };
  });
}

function getProtocol(url) {
  return url.indexOf('https:') === -1 ? http : https;
}

function getObject(id, type) {
  for (var g = 0; g < groups.length; g++) {
    var group = groups[g];
    if (type !== 'group' && group.servers) {
      for (var s = 0; s < group.servers.length; s++) {
        var server = group.servers[s];
        if (type !== 'server' && server.applications) {
          for (var a = 0; a < server.applications.length; a++) {
            var application = server.applications[a];
            if (application.id === id) {
              return application;
            }
          }
        }
        else if (server.id === id) {
          return server;
        }
      }
    }
    else if (group.id === id){
      return group;
    }
  }
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
    client.emit('get:status:result', result);
  });
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
router.get('/test', (req, res) => {
  var data = [];
  knex('measurements').limit(300).orderBy('created_at', 'desc').map(function(row) {
    data.push(row);
  }).then(function() {
    res.send(data);
  });
});

router.post('/performance_update', (req, res) => {
  var server = getObject(req.body.id, 'server');
  if (!server) {
    return;
  }
  var result = {
    server_id: server.id,
    disk_free_in_bytes: req.body.disk_free_in_bytes,
    disk_used_in_bytes: req.body.disk_used_in_bytes,
    disk_total_in_bytes: req.body.disk_used_in_bytes + req.body.disk_free_in_bytes,
    cpu_idle_percentage: req.body.cpu_idle,
    ram_used_in_bytes: req.body.ram_used_in_bytes,
    ram_free_in_bytes: req.body.ram_free_in_bytes,
    ram_total_in_bytes: req.body.ram_used_in_bytes + req.body.ram_free_in_bytes
  };
  knex.insert(result).into('measurements').returning('*').then(function(savedResult) {
    io.emit('get:measurements:server:update', {id: server.id, data: savedResult});
  });
  res.send("Thanks!");
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
console.info("This is Sysiphus.");
process.on('uncaughtException', function (err) {
  console.log(err);
})
