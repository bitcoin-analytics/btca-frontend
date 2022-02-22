var fn = require('../../server/lib/util/fn')
var assert = require('assert')
var nde = require('../util/nanDeepEqual')
var date = require('../../client/code/main/date')

function makeLegacyInvoice()
{
   	return {
		category: 'invoice',
		transaction_timestamp: date.currentTimestamp(),
		amount: -0.5
	}
}

exports.days = function (days)
{
	return days * date.secondsInDay
}

exports.runTest = function (actions, expectedHistory)
{
	var profile = { paymentHistory : [] }
	require('../mock/log')
	var mockDb = require('../mock/db')

	mockDb.db = { user : profile }
	var time = require('../mock/time')
	var mockConsole = require('../mock/console')
	var cron = require('../mock/cron')
	var user = require('../../server/lib/user')
	var userReadyPromise = user.startPollAccountForExpiration()

	var handlers = {
		createAccount : function (action)
		{
			user.createAccount('user', profile, '1jbbitcoinaddress', action.planName)
		}
	,	createLegacyAccount : function ()
		{
			profile.paymentHistory.push(makeLegacyInvoice())
		}
	,	payment : function (action)
		{
			user.onPayment({ category: 'receive',
				transaction_timestamp: date.currentTimestamp(),
				signature: 'cee348aa2f6df8142faa9a84b6e2f04e745f1bb1b678db5b973902b3037f5040',
				amount: action.amount,
				foreign_order_id: 'user',
				number_of_confirmations: '9',
				order_status: 'satisfied',
				transaction_fee: '',
				bitcoin_address: '19iY5dyJz1RBz48gSFKiiSvp5mreMCVHht'
			})
		}
	,	changePlan : function (action)
		{
			user.changePlan('user', profile, action.planName)
		}
	,	expire : function (action)
		{
			for (var i = 0; i < action.duration_days; i++)
			{
				time.advanceDays(1)
				cron.runCallback(0)
			}
		}
	,	legacyExpireAndReactivate : function (action)
		{
			time.advanceDays(action.duration_days)
			assert.ok(user.balance(profile.paymentHistory) >= 0)
			profile.paymentHistory.push(makeLegacyInvoice())
			assert.ok(user.balance(profile.paymentHistory) >= 0)
			profile.paymentHistory.push({
				category: 'activation',
   				duration_days: 30,
   				transaction_timestamp: date.currentTimestamp()
			})
		}
	,	legacyExpire : function (action)
		{
			time.advanceDays(action.duration_days)
			assert.ok(user.balance(profile.paymentHistory) >= 0)
			profile.paymentHistory.push(makeLegacyInvoice())
			assert.ok(user.balance(profile.paymentHistory) < 0)
			profile.paymentHistory.push({
				category: 'expiration',
				transaction_timestamp: date.currentTimestamp()
			})
		}
	}

  userReadyPromise.then(function()
  {
		mockConsole.disable()
		mockConsole.disableError()
		actions.forEach(function (action)
		{
			handlers[action.action](action)
		})
		mockConsole.enable()
		mockConsole.enableError()
		// console.log(profile.paymentHistory)
		// assert.deepEqual(profile.paymentHistory, expectedHistory)
		nde.assertDeepEqual(profile.paymentHistory, expectedHistory)
  })
}