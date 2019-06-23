var	user = require('../user')
,	authLog = require('../log').openLog('auth')
,	util = require('util')
, config = require('../config')
, redirect = require('./oauth').redirect

exports.findOrCreateLinkedinUser = function(session, linkedinUserMetadata, promise)
{
	//console.log("linkedin authentication ok", session)
	session.userId = linkedinUserMetadata.id+'@linkedin'
	session.save()
	var profile = user.profile( session.userId )
	//console.log(profile)
	//console.log(session.userId)
	//console.log(util.inspect(linkedinUserMetadata, true, 1000, true))
	if (typeof profile.nickname != 'string')
	{
		profile.nickname = linkedinUserMetadata.firstName +'.'+ linkedinUserMetadata.lastName +'@linkedin'
		profile.save()
		authLog.log({claimedIdentifier : session.userId, nickname : profile.nickname, category: 'auth_ok'})
	}
	else
	{
		authLog.log({claimedIdentifier : session.userId, category : 'auth_ok'})
	}
	
	promise.fulfill(profile)
}

exports.handleAuthLinkedinCallbackError = function(req, res)
{
	try{
		authLog.log({category : 'auth_failed', service: 'linkedin', error : req.query.error, result : req.query.error_reason+' '+req.query.error_description })
		//console.log(util.inspect(req.query))
		data.req.session.everyauthAuthError = {message : 'Linkedin authentication failed. '+req.query.error_reason+' '+req.query.error_description}
		data.req.session.save()
	}catch(e){
	}
	redirect(res, 'http://'+config.httpHostname+'/')
}

exports.handleAuthLinkedinModuleError = function(err, data)
{
	try{
		authLog.log({category : 'auth_failed', service: 'linkedin', error : err.message})
		//console.log('!!!!!!!!!!!!!!!!!!!!!! linkedin module error')
		//console.log(util.inspect(err, true, 1000, true))
		data.req.session.everyauthAuthError = {message : 'Linkedin authentication failed. Timeout reached during authenitcation, please try later.'}
		data.req.session.save()
		redirect(data.res, 'http://'+config.httpHostname+'/')
	}catch(e){
		console.error(e)
	}
}
