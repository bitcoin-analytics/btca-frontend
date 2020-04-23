const user = require('../lib/user')
const uptime = require('../lib/uptime')

function connectReconnectResponse(req, profile)
{
	var isSubscribed = user.isSubscribed(profile)
	return {
		uptime : uptime.uptime()
	,	profile : profile.clientProfile()
	,	nickname : (typeof profile.nickname == 'string' ? profile.nickname : req.session.userId) 
	,	userId : req.session.userId
	,	isSubscribed : isSubscribed
	}
}

exports.actions = function (req, res, ss)
{
	console.log("Before Use")
	req.use('session')
	console.log("After Use")

	return {
		init : function ()
		{
			console.log('init!!!!!!!!!!!!!!!!!!!!!')
			var profile = user.profile(req.session.userId)
			
			var data = connectReconnectResponse(req, profile)
			data.isEveryAuthError = req.session.everyauthAuthError ? req.session.everyauthAuthError : ''
			req.session.everyauthAuthError = undefined
			req.session.save()
			
			res(data)
		}
	,	initReconnect : function()
		{
			console.log('initReconnect!!!!!!!!!!!!!!!!!!!!!')
			var profile = user.profile(req.session.userId)
			var data = connectReconnectResponse(req, profile)
			res(data)
		}
	,	logout : function()
		{
			console.log('session '+req.session.userId)
			req.session.userId = undefined
			req.session.save()
			res()
		}

	}
}
