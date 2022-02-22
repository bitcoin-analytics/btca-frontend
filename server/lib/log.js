var util = require('util')
,	format = require('sprintf-js').sprintf
,	path = require('path')
,	fs = require('fs')
,	callsites = require('callsites')

function noExt(ff)
{
	var f = path.basename(ff)
  	return f.slice(0, f.length - path.extname(f).length)
}

function formatFrame(frame)
{
        var d = new Date()
        return format('%02d %02d:%02d:%02d %s:%d'
        , d.getDate() // day of month!
        , d.getHours()
        , d.getMinutes()
        , d.getSeconds()
        , noExt(frame.getFileName())
        , frame.getLineNumber()
        )
}


var logs = {}

exports.openLog = function (logName)
{
	if (!logs[logName])
	{
		// TODO make path concatenation cross-platform by using path functions
		var fileName = 'var/log/' + logName + '.log'
		var file = fs.createWriteStream(fileName, {flags : 'a'})
		logs[logName] = {

			log : function ()
			{
				var header = formatFrame(callsites()[1])
				var write = function (s)
				{
					file.write(header + ' ' + s + '\n')
				}
				if (arguments.length == 0)
				{
					write('called')
				}
				else
				{
					var ss = []
					for (var i = 0; i < arguments.length; i++)
					{
						ss.push(arguments[i])
					}
					write(ss.map(JSON.stringify).join(' '))
				}
			}
		}
	}
	return logs[logName]
}

process.on('exit', function (e)
{
	console.error('exiting')
})

process.on('uncaughtException', function (err)
{
	console.error('uncaught exception')
	if (err.stack)
	{
		console.error(err.stack)
	}
	else
	{
		console.error(err)
	}
	process.exit(-12)
})

process.on('SIGTERM', function ()
{
	console.error("SIGTERM received, exiting")
	process.exit(-13)
})

var consoleHook = require('./console-hook')

function patchSystemLog(propertyName)
{
	consoleHook.hook1(propertyName, function (methodName, s)
	{
		var header = formatFrame(callsites()[3]) + ' '
		return consoleHook.filter(header + (s == '' ? 'called' : s))
	})
}

['error', 'log'].forEach(patchSystemLog)
