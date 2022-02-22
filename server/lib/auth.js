'use strict'
const user = require('./user')
	, authLog = require('./log').openLog('auth')
	, util = require('util')
	, { ExpressOIDC } = require('@okta/oidc-middleware')

const redirect = (res, url) => {
	res.writeHead(301, {'Location': url})
	res.end()
}

function findOrCreateUser(session) {
	const userinfo = session.passport.user.userinfo
	session.userId = userinfo.sub
	session.save()
	const profile = user.profile(session.userId)

	if (typeof profile.nickname != 'string')
	{
		profile.nickname = userinfo.name
		profile.save()
		authLog.log({claimedIdentifier : session.userId, nickname : profile.nickname, category: 'auth_ok'})
	}
	else
	{
		authLog.log({claimedIdentifier : session.userId, category : 'auth_ok'})
	}
}

exports.handleAuthCallbackError = function(req, res)
{
	try{
		authLog.log({category : 'auth_failed', service: 'auth', error : req.query.error })
		authLog.log(util.inspect(req.query))
		data.req.session.authError = {message : 'Authentication failed. '+req.query.error}
		data.req.session.save()
	}catch(e){
	}
	redirect(res, '/')
}

exports.handleAuthModuleError = function(err, data)
{
	try{
		authLog.log({category : 'auth_failed', service: 'auth', error : err.message})
		//console.log('!!!!!!!!!!!!!!!!!!!!!! module error')
		//console.log(util.inspect(err, true, 1000, true))
		data.req.session.everyauthAuthError = {message : 'Authentication failed. Timeout reached during authenitcation, please try later.'}
		data.req.session.save()
		redirect(data.res, '/')
	}catch(e){
		console.error(e)
	}
}

const oidc = new ExpressOIDC({
	scope: 'openid profile',
	appBaseUrl: 'http://localhost:3000',
	issuer: 'https://dev-025d9prn.us.auth0.com',
	routes: {
		loginCallback: {
			path: '/authorization-code/callback',
			handler: (req, res, next) => {
				findOrCreateUser(req.session)
				next()
			},
		}
	},
	client_id: '1',
	client_secret: '2'
})

oidc.on('ready', () => {
	console.log('oidc start')
})

oidc.on('error', err => {
	console.log('error', err)
})

exports.router = oidc.router
