const express = require("express")
, app = express()
, router = express.Router();


app.use('/api', router);
router.get('/', (req, res) => {
  res.json({
    message: 'It\'s alive!!'
  });
});

app.use('/', express.static('public'));
app.get('/*', (req, res, next) => {
  //[JG]: Anguar routes are configured to not be hash prefixed.
  if (req.url.indexOf('/api') === 0) {
    next();
  }
  else {
    res.sendFile(__dirname + '/index.html');
  }
});

app.listen(8080);
