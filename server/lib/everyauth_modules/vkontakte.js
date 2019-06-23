var	user = require('../user')
,	authLog = require('../log').openLog('auth')
,	util = require('util')
, config = require('../config')
, redirect = require('./oauth').redirect

exports.findOrCreateVkontakteUser = function(session, vkontakteUserMetadata, promise)
{
	//console.log("linkedin authentication ok", session)
	session.userId = vkontakteUserMetadata.uid+'@vkontakte'
	session.save()
	var profile = user.profile( session.userId )
	//console.log(profile)
	//console.log(session.userId)
	//console.log(util.inspect(vkontakteUserMetadata, true, 1000, true))
	if (typeof profile.nickname != 'string')
	{
		profile.nickname = vkontakteUserMetadata.first_name +'.'+ vkontakteUserMetadata.last_name +'@vkontakte'
		profile.save()
		authLog.log({claimedIdentifier : session.userId, nickname : profile.nickname, category: 'auth_ok'})
	}
	else
	{
		authLog.log({claimedIdentifier : session.userId, category : 'auth_ok'})
	}
	
	promise.fulfill(profile)
}

exports.handleAuthVkontakteCallbackError = function(req, res)
{
	try{
		authLog.log({category : 'auth_failed', service: 'vkontakte', error : req.query.error, result : req.query.error_reason+' '+req.query.error_description })
		//console.log(util.inspect(req.query))
		req.session.everyauthAuthError = {message : 'Vkontakte authentication failed. '+req.query.error_reason+' '+req.query.error_description}
		req.session.save()
	}catch(e){
	}
	redirect(res, 'http://'+config.httpHostname+'/')
}

exports.handleAuthVkontakteModuleError = function(err, data)
{
	try{
		authLog.log({category : 'auth_failed', service: 'vkontakte', error : err.message})
		//console.log('!!!!!!!!!!!!!!!!!!!!!! linkedin module error')
		//console.log(util.inspect(err, true, 1000, true))
		data.req.session.everyauthAuthError = {message : 'Vkontakte authentication failed. Timeout reached during authenitcation, please try later.'}
		data.req.session.save()
		redirect(data.res, 'http://'+config.httpHostname+'/')
	}catch(e){
		console.error(e)
	}
}
