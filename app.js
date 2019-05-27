// My SocketStream 0.4 app

var ss = require('socketstream');

// Define a single-page client called 'main'
ss.client.define('main', {
  view: 'app.html',
  css:  ['../node_modules/normalize.css/normalize.css', 'app.css'],
  code: ['../node_modules/es6-shim/es6-shim.js', 'libs/jquery.min.js', 'app'],
  tmpl: 'chat'
});

// Serve this client on the root URL
ss.http.route('/', function(req, res){
  res.serveClient('main');
});

// Use server-side compiled Hogan (Mustache) templates. Others engines available
ss.client.templateEngine.use(require('ss-hogan'));

// Minimize and pack assets if you type: SS_ENV=production node app.js
if (ss.env === 'production') ss.client.packAssets();

// Start SocketStream
ss.start();