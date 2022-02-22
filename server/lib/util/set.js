var assert = require('assert')

exports.fromList = function (list)
{
	assert.ok(Array.isArray(list))
	var set = {}
	list.forEach(function (item)
	{
		set[item] = true
	})
	return {
		elem : function (item)
		{
			return !!set[item]
		}
	,	member : function (item)
		{
			return !!set[item]
		}
	}
}

exports.isNotInSet = function (set)
{
	return function (item)
	{
		return !set[item]
	}
}