var dirty = require('dirty')

var dbPath = './var/dirty'

exports.open = function (name)
{
	console.log('loading ' + name +  ' db')
	return dirty(dbPath + '/' + name + '.dirty')
}




