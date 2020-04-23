const config = { enableClientBenchmarkLog : true }
try {

var times = {}
exports.mylog = function(msg, stop)
{
	var d = times[msg]
	if(stop)
	{
		if (!d)
		{
			console.error(msg + ' stop called without start')
		}
		if (!d.start)
		{
		  	console.error(msg + ' stop called twice')
		}
		var stamp = new Date()
		var newDiff = stamp - d.startTime
		d.sum += newDiff
		d.sumSq += newDiff * newDiff
		d.count += 1

		// console.log(msg+' stop: '+stamp.toTimeString().split(" ")[0]+':'+stamp.getMilliseconds())

		var avg = d.sum / d.count
		if (d.count > 1)
		{
			var sigma2 = d.count / (d.count -1) * (1 / d.count * d.sumSq - avg * avg)
			var sigma = Math.sqrt(sigma2)
			// console.log(msg + ': ' + avg / 1000)  + ' +- ' + sigma + ' s')
//		  	console.log(msg + ': ' + avg / 1000 + 's')
	  	console.log(msg + ': ' + newDiff / 1000 + 's')
		}
		else
		{
//			console.log(msg + ': ' + avg / 1000 + 's')
	  	console.log(msg + ': ' + newDiff / 1000 + 's')
		}
		d.start = false

	}
	else
	{
		if (!d)
		{
			times[msg] = {
				count : 0,
				sum : 0,
				sumSq : 0
			}
			d = times[msg]
		}
		d.startTime = new Date()
		d.start = true
		// console.log(msg+' start: '+d.startTime.toTimeString().split(" ")[0]+'.'+d.startTime.getMilliseconds())
	}
}

if(config.enableClientBenchmarkLog)
{
	exports.log = {
		start : function (msg) { exports.mylog(msg) }
	,	stop : function (msg) { exports.mylog(msg, true) }
	}
}
else
{
	exports.log = {
		start : function (msg) { }
	,	stop : function (msg) { }
	}	
}

} catch (e)
{
	console.log(e)
}
