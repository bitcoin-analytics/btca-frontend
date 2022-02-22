var hijack = require('hijack')

var fn = require('../../server/lib/util/fn')

hijack.require('../../server/lib/log').replace('openLog', function ()
{
	return { log : fn.noop }
})
