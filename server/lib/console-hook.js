'use strict'
var hooker = require('hooker')
var util = require('util')

exports.hook = function (f)
{
	['log', 'error'].forEach(function (methodName)
	{
		exports.hook1(methodName, f)
	})
}

exports.hook1 = function (methodName, f)
{
	hooker.hook(console, methodName, function ()
        {
		return f(methodName, util.format.apply(this, arguments))
        })
}

exports.filter = function (s)
{
	return hooker.filter(console, ["%s", s])
}

exports.preempt = hooker.preempt

var prefix = {
	'log' : '<6>'
,	'error' : '<3>'
}




