var util = require('util')
var assert = require('assert')
exports.assertDeepEqual = assertNanDeepEqual

function myFail(a, b, op)
{
	assert.fail(a, b, util.inspect(a) + ' != ' + util.inspect(b))
}

function nanDeepEqual(a, b)
{
	if (util.isArray(a))
	{
		if (!util.isArray(b) || a.length != b.length)
		{
			return false
		}
		for (var i = 0; i < a.length; i++)
		{
			if (!nanDeepEqual(a[i], b[i]))
			{
				myFail(a[i], b[i])
			}
		}
		return true
	}
	else {
		if (typeof a == "number")
		{
			return (typeof b == "number" && ((isNaN(a) && isNaN(b)) || Math.abs(a - b) <= 0.00001 ))
		}
		else if (typeof a == typeof b && (typeof a == 'string' || typeof a == 'boolean'))
		{
			if (a == b)
			{
				return true
			}
			else
			{
				assert.fail(typeof a, typeof b, 'nanDeepEqual assertion failed - expected = ' + util.inspect(b) + ", actual = " + util.inspect(a)  , 'nanDeepEqual')
			}
		}
		else if (typeof a == 'object' && typeof b == 'object')
		{
			for (var k in a)
			{
				if (!nanDeepEqual(a[k], b[k]))
				{
					assert.fail(typeof a, typeof b, 'nanDeepEqual assertion failed - expected = ' + util.inspect(b[k]) + ", actual = " + util.inspect(a[k])  , 'nanDeepEqual')
				}
			}
			return true
		}
		else
		{
			console.log(a)
			assert.fail(typeof a, typeof b, 'nanDeepEqual assertion failed - expected = ' + typeof b + ", actual = " + typeof a  , 'nanDeepEqual')
		}
	}
	console.log(typeof a)
	throw new Error("nanDeepEqual - first operand must be an Array or a number")
}

function assertNanDeepEqual(a, b)
{
	try {
		if (!nanDeepEqual(a, b))
		{
			throw new Error('nanDeepEqual failed')
		}
	}
	catch (e)
	{
		assert.fail(a, b, 'assertion failed: (' + e.message + ')\nAct: ' +  util.inspect(a) + '\nExp: ' + util.inspect(b))
	}
}