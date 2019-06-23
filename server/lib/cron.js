var assert = require('assert')

function runNTimesPerHour(n, f)
{
	var _stopCron = false
	var timeoutId
	assert.ok(n, 'frequency parameter is not defined')
	var nextTime

	var run = function ()
	{
		nextTime += 3600 * 1000 / n
		if (!_stopCron)
		{
			timeoutId = setTimeout(run, nextTime - Date.now())
			f()
		}
		else
		{
			console.error('runNTimesPerHour', new Date())
		}
	}
	var to = 1000 * alignmentForNTimesPerHour(new Date(), n)
	nextTime = Date.now() + to
	timeoutId = setTimeout(run, to)
	
	return {
		stopCron : function()
		{
			_stopCron = true
			clearTimeout(timeoutId)
			console.error('cron stopped!!!!!')
		}
	}
}

function alignmentForNTimesPerHour(d, freq)
{
	var seconds = d.getUTCMinutes() * 60 + d.getUTCSeconds() + d.getMilliseconds() / 1000
	var interval = 3600 / freq

	if (seconds % interval == 0)
	{
		return 0
	}
	else
	{
		return (interval - seconds % interval)
	}
}

exports.waitUntil = function (d, f)
{
	if (new Date() < d)
	{
		f()
		return
	}
	var i
	i = setInterval(function ()
	{
		if (new Date() >= d)
		{
			f()
			clearInterval(i)
		}
	}, 60 * 1000)
}

exports.runNTimesPerHour = runNTimesPerHour
exports.alignmentForNTimesPerHour = alignmentForNTimesPerHour