var hijack = require('hijack')

var callbacks = []

hijack.require('../../server/lib/cron').replace('runNTimesPerHour', function (interval, callBack)
{
	callbacks.push(callBack)
})

exports.runCallback = function (idx)
{
	callbacks[idx]()
}
