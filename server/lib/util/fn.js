exports.noop = function () {}

var Q = require('q')

exports.noopAsync = function ()
{
	var ready = Q.defer()

	ready.resolve()

	return ready.promise
}


exports.const = function (c)
{
	return function ()
	{
		return c
	}
}

exports.id = function (c)
{
	return c
}

function logExceptions(f)
{
	try {
		f()
	}
	catch (e)
	{
		console.error(e.stack || e)
	}
}

exports.logExceptions = logExceptions