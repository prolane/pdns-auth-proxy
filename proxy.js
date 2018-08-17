// Load the local config file
const config = require('./config.json');

var express      = require("express"),
    requestProxy = require("express-request-proxy")

var app = express();

app.all("/api/:apiversion/servers/:server/zones/:zone", function(req, res, next) {
  var proxy = requestProxy({
    url: config.backend + req.path,
    headers: {
      "X-API-Key": config.XApiKey
    }
  });
  // Check api-key with zone
  if (req.get("X-API-Key") in config.keys) {
    // API Key is valid. Check if it matches the zone.
    if (config.keys[req.get("X-API-Key")] != req.params.zone) {
      res.status(403).send('Not authorized for zone "' + req.params.zone + '"!');
      console.log("WARN: API-Key '" + req.get("X-API-Key") + "' tried accessing zone " + req.params.zone);
    }
  } else {
    res.status(401).send('Unknown API Key!');
  }
  proxy(req, res, next);
});

// Start the proxy
app.listen(config.proxyPort, () => console.log('pdns-auth-proxy started and listening on port ' + config.proxyPort +'!'));