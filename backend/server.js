const express = require("express");
const app = express();
const router = express.Router();
const exec = require('child_process').exec;
var server = require('http').createServer(app);
var io = require('socket.io')(server);
io.on('connection', function(client) {
  client.on('status:get', function(fromClient) {
    if (fromClient.url) {
      var child = exec("curl --verbose -s -w \"\n___STARTTIME___%{time_total}___ENDTIME___\" \"" + fromClient.url + '\"');
      var data = '';
      child.stderr.on('data', function(curlResult) {
        if (curlResult) {
          data += curlResult;
        }
      });
      child.stdout.on('data', function(curlResult) {
        if (curlResult) {
          data += curlResult;
        }
      });
      child.on('close', function() {
        var secondary = exec("curl " + fromClient.url + "/sysiphus.php");
        var secondaryData = '';
        secondary.stdout.on("data", function(curlResult) {
          secondaryData += curlResult;
        });
        secondary.on("close", function(curlResult) {
          var secondaryJson = {};
          if (secondaryData.indexOf('sysiphus-status') !== -1) {
            secondaryJson = JSON.parse(secondaryData);
          }
          var result = {
            url: fromClient.url,
            lastUpdated: new Date(),
            timeTaken: getTimeTaken(data),
            server: getServer(data),
            up: data.indexOf('Could not resolve host') === -1,
            verified: data.indexOf(fromClient.verification) !== -1,
            ip: getIP(data),
            disk_used_in_bytes: secondaryJson.disk_used_in_bytes,
            disk_free_in_bytes: secondaryJson.disk_free_in_bytes,
            disk_total_in_bytes: secondaryJson.disk_total_in_bytes
          };
          client.emit('status:get:result', result);
        });

      });
    }
    else {
      var result = {
        url: fromClient.url,
        lastUpdated: new Date(),
        up: false,
        verified: false
      };
      client.emit('status:get:result', result);
    }
  });
});

function getServer(data) {
  if (data.indexOf('< Server: ') !== -1) {
    var key = '< Server: ';
    var startAt = data.indexOf(key) + key.length;
    var endAt = data.indexOf('\n', startAt + 1);
    return data.substring(startAt, endAt);
  }
}

function getTimeTaken(data) {
  return data.substring(data.lastIndexOf('___STARTTIME___') + '___STARTTIME___'.length, data.lastIndexOf('___ENDTIME___'));
}

function getIP(data) {
  if (data.indexOf('Trying ') !== -1) {
    return data.substring(data.indexOf('Trying ') + 'Trying '.length, data.indexOf('...'));
  }
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

server.listen(8080);
