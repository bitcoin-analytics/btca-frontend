var secondsInDay = 24 * 60 * 60 // 86400

exports.secondsInDay = secondsInDay

exports.addDays = function (ts, days)
{
	return ts + secondsInDay * days
}

exports.currentTimestamp = function ()
{
	return Math.round(Date.now() / 1000)
}