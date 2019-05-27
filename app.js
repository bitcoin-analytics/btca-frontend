var ss = require('socketstream')

ss.client.define('main', {
	view:   'app.jade',
	css:    ['libs', 'app.styl'],
	code:   ['libs', 'main', 'system'],
	tmpl:   ['main']
})

ss.client.formatters.add(require('ss-coffee'))
ss.client.formatters.add(require('ss-jade'))
ss.client.formatters.add(require('ss-stylus'))

ss.http.route('/', function(req, res){
	res.serveClient('main')
})

if (ss.env === 'production') ss.client.packAssets()

ss.start()
