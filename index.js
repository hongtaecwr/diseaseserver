// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
var ParseDashboard = require('parse-dashboard');


var databaseUri = 'mongodb://heroku_c9gbv5tm:juv1414cfnfqbm9icej8s3oa6v@ds137255.mlab.com:37255/heroku_c9gbv5tm';

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

//var allowInsecureHTTP = true;
var trustProxy = true;
var dashboard = new ParseDashboard({
  "apps": [{
    "serverURL": "https://diseaseserver.herokuapp.com/parse",
    "appId": "myAppId",
    "masterKey": "myMasterKey",
    "appName": "diseaseserver",
  }],
  "users": [{
    "user": "hongtaedb",
    "pass": "hongtaedb"
  }],
  "trustProxy": 1
});

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://heroku_c9gbv5tm:juv1414cfnfqbm9icej8s3oa6v@ds137255.mlab.com:37255/heroku_c9gbv5tm',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || 'myMasterKey', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'https://diseaseserver.herokuapp.com/parse', // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/dashboard', dashboard);

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
