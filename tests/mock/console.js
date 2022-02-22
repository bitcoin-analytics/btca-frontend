var fn = require('../../server/lib/util/fn')

var oldError = console.error
var oldLog = console.log


function lookupTable(a)
{
	var table = {};

	a.forEach(function (x)
	{
		table[x] = true
	})
	return table
}

var errArgs = lookupTable(['exiting', 'users db loaded and ready', 'start cron'])

console.error = function (x)
{
	if (!errArgs[x])
	{
		oldError.apply(this, arguments)
	}
}

var logArgs = lookupTable([
	'floatsSize = 720'
,	'attempting to connect'
,	'connected'
,	'users db loaded and ready'
,	'collecting'
,	'collected'
, 'start cron'
])

var a = new RegExp("No .* data from depthAPI")


console.log = function (x)
{
	if (!logArgs[x] && !a.test(x))
	{
		oldLog.apply(this, arguments)
	}
}

var xOldLog = console.log
var xOldError = console.error

exports.disable = function ()
{
	console.log = fn.noop
}

exports.enable = function ()
{
	console.log = xOldLog
}

exports.disableError = function ()
{
	console.error = fn.noop
}

exports.enableError = function ()
{
	console.error = xOldError
}
