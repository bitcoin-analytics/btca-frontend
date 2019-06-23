var	user = require('../user')
,	authLog = require('../log').openLog('auth')
,	util = require('util')
, config = require('../config')
, redirect = require('./oauth').redirect

exports.findOrCreateGoogleUser = function(session, googleUserMetadata, promise)
{
	//console.log("linkedin authentication ok", session)
	authLog.log(util.inspect(googleUserMetadata))
	session.userId = googleUserMetadata.id+'@google'
	session.save()
	var profile = user.profile( session.userId )
	//console.log(profile)
	//console.log(session.userId)
	//console.log(util.inspect(linkedinUserMetadata, true, 1000, true))
	if (typeof profile.nickname != 'string')
	{
		profile.nickname = googleUserMetadata.name+'@google'
		profile.save()
		authLog.log({claimedIdentifier : session.userId, nickname : profile.nickname, category: 'auth_ok'})
	}
	else
	{
		authLog.log({claimedIdentifier : session.userId, category : 'auth_ok'})
	}
	
	promise.fulfill(profile)
}

exports.handleAuthGoogleCallbackError = function(req, res)
{
	try{
		authLog.log({category : 'auth_failed', service: 'google', error : req.query.error })
		authLog.log(util.inspect(req.query))
		data.req.session.everyauthAuthError = {message : 'Google authentication failed. '+req.query.error}
		data.req.session.save()
	}catch(e){
	}
	redirect(res, 'http://'+config.httpHostname+'/')
}

exports.handleAuthGoogleModuleError = function(err, data)
{
	try{
		authLog.log({category : 'auth_failed', service: 'google', error : err.message})
		//console.log('!!!!!!!!!!!!!!!!!!!!!! linkedin module error')
		//console.log(util.inspect(err, true, 1000, true))
		data.req.session.everyauthAuthError = {message : 'Google authentication failed. Timeout reached during authenitcation, please try later.'}
		data.req.session.save()
		redirect(data.res, 'http://'+config.httpHostname+'/')
	}catch(e){
		console.error(e)
	}
}
