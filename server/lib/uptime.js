var util = require('util')

exports.uptime = function()
{
	var uptime = process.uptime()

	var h = Math.floor(uptime / 3600)
	var m = Math.floor(uptime % 3600 / 60)
	var s = Math.floor(uptime % 3600 % 60)
	return util.format('uptime: %d h %d m', h, m)
}