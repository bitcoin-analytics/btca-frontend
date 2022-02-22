var timeKeeper = require('timekeeper')
var date = require('../../client/code/main/date')
var currentTs = 0

timeKeeper.freeze(currentTs)

exports.advanceDays = function (days)
{
	currentTs = date.addDays(currentTs, days)
	timeKeeper.freeze(currentTs * 1000)
}
