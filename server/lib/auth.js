var	user = require('./user')
,	authLog = require('./log').openLog('auth')
,	util = require('util')
, config = require('./config')

const redirect = (res, url) => {
	res.writeHead(301, {'Location' : url })
	res.end()
}

exports.findOrCreateUser = function(session, userMetadata, promise)
{
	//console.log("authentication ok", session)
	authLog.log(util.inspect(userMetadata))
	session.userId = userMetadata.id
	session.save()
	var profile = user.profile( session.userId )
	//console.log(profile)
	//console.log(session.userId)
	//console.log(util.inspect(userMetadata, true, 1000, true))

if (typeof profile.nickname != 'string')
	{
		profile.nickname = userMetadata.name
		profile.save()
		authLog.log({claimedIdentifier : session.userId, nickname : profile.nickname, category: 'auth_ok'})
	}
	else
	{
		authLog.log({claimedIdentifier : session.userId, category : 'auth_ok'})
	}
	
	promise.fulfill(profile)
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
	redirect(res, 'http://'+config.httpHostname+'/')
}

exports.handleAuthModuleError = function(err, data)
{
	try{
		authLog.log({category : 'auth_failed', service: 'auth', error : err.message})
		//console.log('!!!!!!!!!!!!!!!!!!!!!! module error')
		//console.log(util.inspect(err, true, 1000, true))
		data.req.session.everyauthAuthError = {message : 'Authentication failed. Timeout reached during authenitcation, please try later.'}
		data.req.session.save()
		redirect(data.res, 'http://'+config.httpHostname+'/')
	}catch(e){
		console.error(e)
	}
}
