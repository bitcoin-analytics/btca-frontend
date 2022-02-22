var hijack = require('hijack')

var fn = require('../../server/lib/util/fn')
var map = require('../../server/lib/util/map')

exports.db = {}

hijack.require('../../server/lib/db').replace('open', function ()
{
	return {
		get : function (user)
		{
			return exports.db[user]
		}
	,	set : function (user, profile)
		{
			exports.db[user] = profile
		}
	,	on : function (eventName, callBack)
 		{
			callBack()
		}
	,	forEach : function (callback)
		{
			map.forEach(exports.db, callback)
		}
	}

})
