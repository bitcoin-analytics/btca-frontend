console.error("appJs")
var	ss = require('socketstream')
,	fs = require('fs')
,	express = require('express')
,	ExpressOIDC = require('@okta/oidc-middleware').ExpressOIDC
var bodyParser = require('body-parser')
var morgan = require('morgan')

function openForAppend(fileName)
{
	return fs.createWriteStream(fileName, {'flags': 'a'})
}


ss.client.define('main', {
	view:   'app.jade',
	css:    ['libs', 'app.styl'],
	code:   ['libs', 'main', 'system'],
	tmpl:   ['main']
})

ss.client.set({liveReload: false})

// Remove to use only plain .js, .html and .css files if you prefer
ss.client.formatters.add(require('ss-coffee'))
ss.client.formatters.add(require('ss-jade'))
ss.client.formatters.add(require('ss-stylus'))
/*
ss.session.store.use('redis');
ss.publish.transport.use('redis');
*/
ss.ws.transport.use('engineio', { io: function(io) {
   var m = 3
   io.set('close timeout', 25 * m)
   io.set('heartbeat timeout', 15 * m)
   io.set('heartbeat interval', 20 * m)
}})

// Minimise and pack assets if you type SS_ENV=production node app
if (ss.env == 'production') ss.client.packAssets();

let socketIoRequestHandler = null

function routes(app)
{
	const oidc = new ExpressOIDC({
		scope: 'openid profile',
		appBaseUrl: 'http://localhost:3000',
		issuer: 'https://dev-025d9prn.us.auth0.com',
		client_id: '1',
		client_secret: '2'
	})
	app.use(oidc.router)

/*
	app.get('/billing/blockchain/notify', billingBlockchain.notify(user.onPayment))
	app.get('/billing/blockchain2/notify', billingBlockchain2.notify(user.onPayment))
*/
	app.get('/', function (req, res)
	{
		console.log('root', req.userContext)
		res.serveClient('main')
	})
	app.all('/engine.io/*', (req, res, next) => socketIoRequestHandler(req, res, next))

	oidc.on('ready', () => {
		console.log('oidc start')
	});

	oidc.on('error', err => {
		console.log('error', err)
	});
}

ss.http.middleware.prepend(morgan('combined', { stream: openForAppend("var/log/http.log")}))
ss.http.middleware.append(bodyParser())

const router = express.Router()
routes(router)
ss.http.middleware.append(router)

const app = express()

const server = app.listen(3000) //, '127.0.0.1');
const expressListener = server.listeners('request')
ss.start(server)

// reset listeners
const ioRequestListener = server.listeners('request')

socketIoRequestHandler = function (req, res) {
	console.log(req.url)
	ioRequestListener.forEach(function (listener) {
		listener.call(server, req, res)
	})
}

server.removeAllListeners('request')
expressListener.forEach(function (l) {
	server.on('request', l)
})

app.use(ss.http.middleware)
