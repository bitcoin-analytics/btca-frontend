var t = require('./mock/time')
var assert = require('assert')

assert.equal(Date.now(), 86400 * 1000 *  0)
t.advanceDays(1)
assert.equal(Date.now(), 86400 * 1000 * 1)
t.advanceDays(29)
assert.equal(Date.now(), 86400 * 1000 * 30)

