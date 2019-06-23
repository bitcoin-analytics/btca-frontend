var _ = require('underscore')

exports.singleton = function (key, value)
{
	var map = {	}
	map[key] = value
	return map
}


exports.forEach = function (map, f)
{
	var out = []
	var push = out.push.bind(out)
	for (var key in map)
	{
		f(key, map[key], push)
	}
	return out
}
	
exports.swapKeysAndValues = function (h)
{
	var out = {}
	for (var key in h)
	{
		out[h[key]] = key
	}
	return out
}

exports.subtractKeysArray = function (map, keysArray)
{
	var out = _.clone(map)
	keysArray.forEach(function (key)
	{
		delete out[key]
	})
	return out
}


function mapHash(h, f)
{
	for (var k in h)
	{
		// console.log('k,v', k, h[k])
		h[k] = f(k, h[k])
	}
	return h
}

exports.mapHash = mapHash

function hkeys(h)
{
	return mapHash(h, function ()
	{
		return ''	
	})
	var keys = {}
}

exports.forEachDefinedValue = function(map, fn)
{
	for (var key in map)
	{
		var value = map[key]
		if (value)
		{
			fn(key, value)
		}
	}
}
