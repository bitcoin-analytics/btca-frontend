var	user = require('../user')
,	authLog = require('../log').openLog('auth')
,	util = require('util')
, config = require('../config')
, url = require('url')

exports.redirect = function (res, url)
{
	res.writeHead(301, {'Location' : url })
	res.end()
}

exports.findOrCreateFacebookUser = function(session, fbUserMetadata, promise)
{
	//console.log("facebook authentication ok", session)
	session.userId = fbUserMetadata.id+'@facebook'
	session.save()
	var profile = user.profile( session.userId )
	//console.log(profile)
	//console.log(session.userId)
	//console.log(util.inspect(fbUserMetadata, true, 1000, true))
	if (typeof profile.nickname != 'string')
	{
		profile.nickname = (fbUserMetadata.username ? fbUserMetadata.username : fbUserMetadata.name)+'@facebook'
		profile.save()
		authLog.log({claimedIdentifier : session.userId, nickname : profile.nickname, category: 'auth_ok'})
	}
	else
	{
		authLog.log({claimedIdentifier : session.userId, category : 'auth_ok'})
	}
	
	promise.fulfill(profile)
}

exports.handleAuthFacebookCallbackError = function(req, res)
{
	authLog.log({category : 'auth_failed', service: 'facebook', error : req.query.error, result : req.query.error_reason+' '+req.query.error_description })
	//console.log(util.inspect(req.query))
	req.session.everyauthAuthError = {message : 'Facebook authentication failed. '+req.query.error_reason+' '+req.query.error_description}
	req.session.save()
	exports.redirect(res, 'http://'+config.httpHostname+'/')
}

exports.handleAuthFacebookModuleError = function(err, data)
{
	try {
		authLog.log({category : 'auth_failed', service: 'facebook', error : err.message})
		//console.log('!!!!!!!!!!!!!!!!!!!!!! facebook module error')
		//console.log(util.inspect(err, true, 1000, true))
		data.req.session.everyauthAuthError = {message : 'Facebook authentication failed. Timeout reached during authenitcation, please try later.'}
		data.req.session.save()
		exports.redirect(data.res, 'http://'+config.httpHostname+'/')
	} catch(e) {
		console.error(e)
	}
}

exports.findOrCreateTwitterUser = function(session, twitterUserMetadata, promise)
{
	//console.log("twitter authentication ok", session)
	session.userId = twitterUserMetadata.id_str+'@twitter'
	session.save()
	var profile = user.profile( session.userId )
//	console.log(profile)
//	console.log(session.userId)
	//console.log(util.inspect(twitterUserMetadata, true, 1000, true))
	if (typeof profile.nickname != 'string')
	{
		profile.nickname = (twitterUserMetadata.screen_name ? twitterUserMetadata.screen_name : twitterUserMetadata.name)+'@twitter'
		profile.save()
		authLog.log({claimedIdentifier : session.userId, nickname : profile.nickname, category: 'auth_ok'})
	}
	else
	{
		authLog.log({claimedIdentifier : session.userId, category : 'auth_ok'})
	}
	
	promise.fulfill(profile)
}

exports.handleAuthTwitterCallbackError = function(req, res)
{
	authLog.log({category : 'auth_failed', service: 'twitter', error : req.query.denied ? 'denied' : 'error', denied : req.query.denied })
	console.log(util.inspect(req.query))
	req.session.everyauthAuthError = {message : 'Twitter authentication failed. '+(req.query.denied ? 'Cancelled.' : '')}
	req.session.save()
	exports.redirect(res, 'http://'+config.httpHostname+'/')
}

exports.handleAuthTwitterModuleError = function(err, data)
{
	try {
		authLog.log({category : 'auth_failed', service: 'twitter', error : err.message})
		//console.log('!!!!!!!!!!!!!!!!!!!!!! twitter module error')
		//console.log(util.inspect(err, true, 1000, true))
		data.req.session.everyauthAuthError = {message : 'Twitter authentication failed. Timeout reached during authenitcation, please try later.'}
		data.req.session.save()
		//console.log(util.inspect(req.query))
		exports.redirect(data.res, 'http://'+config.httpHostname+'/')
	} catch(e) {
		console.error(e)
	}
}

//OpenID
exports.findOrCreateOpenidUser = function(session, openidUserMetadata, promise)
{
	//console.log("openid authentication ok", session)
	
	
	
	session.userId = url.parse(openidUserMetadata.claimedIdentifier, true).href
	session.save()
	var profile = user.profile( session.userId )
	//console.log(profile)
	//console.log(session.userId)
	if (typeof profile.nickname != 'string' && typeof openidUserMetadata.email == 'string')
	{
		profile.nickname = openidUserMetadata.email
		profile.save()
		authLog.log({claimedIdentifier : session.userId, email : openidUserMetadata.email, category: 'auth_ok'})
	}
	else
	{
		authLog.log({claimedIdentifier : session.userId, category : 'auth_ok'})
	}

	promise.fulfill(profile)
}

/*exports.handleAuthOpenidCallbackError = function(req, res)
{
	//authLog.log({category : 'auth_failed', service: 'twitter', error : req.query.denied ? 'denied' : 'error', denied : req.query.denied })
	//console.log(util.inspect(req.query))
	data.req.session.everyauthAuthError = {message : 'Openid authentication failed. '+req.query.denied}
	data.req.session.save()
	redirect(res, 'http://'+config.httpHostname+'/')
}*/

exports.handleAuthOpenidModuleError = function(err, data)
{
	try {
		authLog.log({category : 'auth_failed', service: 'openid', error : err.message})
		//console.log('!!!!!!!!!!!!!!!!!!!!!! openid module error')
		//console.log(util.inspect(err, true, 1000, true))
		data.req.session.everyauthAuthError = {message : 'Openid authentication failed. '+err.message}
		data.req.session.save()
		//console.log(util.inspect(req.query))
		exports.redirect(data.res, 'http://'+config.httpHostname+'/')
	} catch(e) {
		console.error(e)
	}
}
