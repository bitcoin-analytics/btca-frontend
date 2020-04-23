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

function sortHashKeys(h)
{
	var keys = []
	for (var k in h) keys.push(k)
	return keys.sort()
}

exports.forEachSorted = function (map, f)
{
	var out = []
	var push = out.push.bind(out)
	keys = sortHashKeys(map)
	keys.forEach(function(key)
	{
		f(key, map[key], push)
	})
	return out
}
