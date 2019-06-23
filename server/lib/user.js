var isoDate = require('./isoDate')
,	cron = require('./cron')
,	_ = require('underscore')
,	db = require('./db')
,	config = require('./config')
,	Q = require('q')

var subscriptionFee = 0.5
var satoshi = 1e-8

var plans = config.plans

var defaultPlan = '0.5 monthly'

exports.profile = function (userId)
{
	var user = userId
	var u = users.get(user)
 	if (!u)
	{
		u = { paymentHistory : [], arbitrageAlerts: []}
	}
	u.save = function ()
	{
		users.set(user, this)
	}
	u.clientProfile = function()
	{
		var cp = {
			bitcoinAddress : this.bitcoinAddress
		,	paymentHistory : this.paymentHistory
		,	currentPlanName : currentPlanName(this.paymentHistory)
		,	arbitrageAlerts : this.arbitrageAlerts ? this.arbitrageAlerts : []
		,	arbitragePins : this.arbitragePins ? this.arbitragePins : []
		, arbitrageAlertsState: getArbitrageAlertsState(userId)
		}
				
		if ('blockchainShowMigrationMessage' in this)
		{
				cp['blockchainShowMigrationMessage'] = this.blockchainShowMigrationMessage
 		}
		
		return cp
	}
	return u
}

exports.updateAlerts = function(profile, alerts)
{
	profile.arbitrageAlerts = alerts
}

exports.updatePins = function(profile, pins)
{
	profile.arbitragePins = pins
}

exports.balance = function (paymentHistory)
{
	if (!paymentHistory)
	{
		return undefined
	}
	else
	{
		return paymentHistory.reduce(
			function (res, item) { return item.amount ? res + parseFloat(item.amount) : res }
		,	0
		)
	}
}
	
exports.isSubscribed = function (profile)
{
	return profile && profile.paymentHistory.length > 0 && exports.balance(profile.paymentHistory) >= -satoshi
}

function updateProfileItem(user, itemName, defaultValue, map)
{
	var p = users.get(user)
	var i = p[itemName]

	p[itemName] = map(i ? i : defaultValue)
	users.set(user, p)
}

var payflowLog = require('./log').openLog('blockchain')

var pn_example = { 'Payment Notification':
   { category: 'receive',
     transaction_timestamp: '1311264710',
     signature: 'cee348aa2f6df8142faa9a84b6e2f04e745f1bb1b678db5b973902b3037f5040',
     amount: '0.01',
     foreign_order_id: 'http://moxorowich.myopenid.com/',
     number_of_confirmations: '9',
     order_status: 'satisfied',
     transaction_fee: '',
     bitcoin_address: '19iY5dyJz1RBz48gSFKiiSvp5mreMCVHht' } }

function compareProperty(a, b, prop)
{
   	return a[prop] == b[prop]
}

function processPayment(j, history)
{
	var user = j.foreign_order_id
	delete j.order_status
	delete j.foreign_order_id
	delete j.bitcoin_address
	delete j.signature
	j.transaction_timestamp = new Date().getTime() / 1000
	
	var idx = findFirst(history, function (a)
	{
		return a.category == 'receive' && compareProperty(a, j, 'transaction_hash') && compareProperty(a, j, 'amount')
	})
	if (idx !== null)
	{
		console.log("found!!!!!!!!!!", idx)
		//history[idx] = j
	}
	else
	{
		console.log("miss!!!!!!!!!!")

		var oldBalance = exports.balance(history)

		history.push(j)

		var newBalance = exports.balance(history)
		console.log({ oldBalance : oldBalance, newBalance : newBalance })

		if (oldBalance < -satoshi && newBalance >= -satoshi)
		{
			addActivation(user, history)
		}
	}

	// user.addActivation(req.session.userId, profile)

	return history
}

function findFirst(array, matches)
{
	for (var i = 0; i < array.length; i++)
	{
		if (matches(array[i]))
		{
			return i
		}
	}
	return null
}

exports.onPayment = function (j)
{
//	console.log(j)
	payflowLog.log(j)
	var user = j.foreign_order_id
	updateProfileItem(user, 'paymentHistory', [], function (item)
	{
		return processPayment(j, item)
	})
}

exports.test = function()
{
	var pn = _.clone(pn_example['Payment Notification'])
	var h = processPayment(_.clone(pn), [])
	console.log(h)
	h = processPayment(_.clone(pn), h)
	console.log(h)
	h[0].amount += 1
	h = processPayment(_.clone(pn), h)
	console.log(h)
}

// TODO must be moved to db.js

var users = db.open('users')
var usersDbLoadedReady = Q.defer()

users.on('load', function ()
{
	console.error('users db loaded and ready')
	users.loaded = true
	usersDbLoadedReady.resolve()
})

exports.startPollAccountForExpiration = function()
{
	//console.error('start cron')
	usersDbLoadedReady.promise.then(
		cron.runNTimesPerHour.bind(cron, 120, function ()
		{
			//console.error('Polling accounts for expiration')
			users.forEach(pollAccountForExpiration)
		})
	)
	
	exports.refreshArbitrageAlertsList()
	
	return usersDbLoadedReady.promise
}

exports.usersDbLoadedReadyPromise = usersDbLoadedReady.promise

exports.getUsersDb = function()
{
	return users
}


var clientBilling = require('../../client/code/main/billing')

function isActivationOrExpiration(historyItem)
{
	return historyItem.category == "activation" || historyItem.category == "expiration"
}

function findLast(array, matches)
{
	var found = null
	for (var i = 0; i < array.length; i++)
	{
		if (matches(array[i]))
		{
			found = i
		}
	}
	return found
}

function lastActivationOrExpiration(paymentHistory)
{
	var lastActivationIdx = findLast(paymentHistory, isActivationOrExpiration)
	return lastActivationIdx != null ? paymentHistory[lastActivationIdx] : null
}

function currentPlanName(paymentHistory)
{
	var lastIdx = findLast(paymentHistory, function (historyItem)
	{
		return historyItem.category == 'changePlan'
	})
	return lastIdx != null ? paymentHistory[lastIdx].planName : defaultPlan
}

function currentTimestamp()
{
	return new Date().getTime() / 1000
}

function pollAccountForExpiration(userId, profile)
{
	if (!profile.paymentHistory)
	{
		return
	}
	var activationRecord = lastActivationOrExpiration(profile.paymentHistory)
	if (activationRecord == null || activationRecord.category == "expiration")
	{
		return
	}
	var expirationTs = parseFloat(activationRecord.transaction_timestamp) + activationRecord.duration_days * 86400
	if (expirationTs > currentTimestamp())
	{
		return
	}

	console.error('unsubscription!')
	exports.addInvoice2(userId, profile, currentPlanName(profile.paymentHistory))
	if (exports.balance(profile.paymentHistory) >= 0)
	{
		addActivation(userId, profile.paymentHistory)
	}
	else
	{
		addExpiration(userId, profile.paymentHistory)
	}
	users.set(userId, profile)
}
	
exports.createAccount = function (userId, profile, bitcoinAddress, planName)
{
	profile.bitcoinAddress = bitcoinAddress
	if (!profile.paymentHistory)
	{
		profile.paymentHistory = []
	}
	addHistoryRecord(userId, profile.paymentHistory, function ()
	{
		return { category : 'changePlan', prevPlanName : '', planName : planName }
	})
	exports.addInvoice2(userId, profile, planName)
}
	
exports.changePlan = function (userId, profile, planName)
{
	var userInactive = !exports.isSubscribed(profile) 

	if (userInactive)
	{
		cancelInvoice(userId, profile)
	}
	addHistoryRecord(userId, profile.paymentHistory, function ()
	{
		return { 
			category : 'changePlan'
		, 	prevPlanName : currentPlanName(profile.paymentHistory)
		,	planName : planName 
		}
	})

	if (userInactive)
	{
		exports.addInvoice2(userId, profile, planName)
		var newBalance = exports.balance(profile.paymentHistory)
		if (newBalance >= 0)
		{
			console.log('Activate after changeplan invoice', { newBalance : newBalance })
			addActivation(userId, profile.paymentHistory)
		}

	}
	
}
	
function cancelInvoice(userId, profile)
{
	addHistoryRecord(userId, profile.paymentHistory, function ()
	{
		var planName = currentPlanName(profile.paymentHistory)
		return {
			category : "cancelInvoice"
		,	amount : plans[planName].subscriptionFee
		,	planName : planName
		}
	})
}
	
exports.addInvoice2 = function (userId, profile, planName)
{
	addHistoryRecord(userId, profile.paymentHistory, function () 
	{
		return {
			category : "invoice"
		,	amount: - plans[planName].subscriptionFee
		,	planName : planName
		}
	})
}


exports.addInvoice = function (userId, profile)
{
	var ts = new Date().getTime() / 1000
	profile.paymentHistory.push({
		category : "invoice"
	,	transaction_timestamp : ts
	,	amount: -subscriptionFee
	})
	payflowLog.log({
		category : "invoice"
	,	transaction_timestamp : ts
	,	amount: -subscriptionFee
	,	foreign_order_id : userId
	})
	console.log({
		category : "invoice"
	,	transaction_timestamp : ts
	,	amount: -subscriptionFee
	,	foreign_order_id : userId
	})
}

function addHistoryRecord(userId, history, f)
{
	var ts = new Date().getTime() / 1000
	var record = f(ts)
	record.transaction_timestamp = ts
	history.push(record)

	var logRecord = _.clone(record)
	logRecord.foreign_order_id = userId
	payflowLog.log(logRecord)
	console.log(logRecord)
}

function addActivation(userId, history)
{
	addHistoryRecord(userId, history, function ()
	{
		return {
			category : "activation"
		,	duration_days : plans[currentPlanName(history)].duration_days
		}
	})
}

function addExpiration(userId, history)
{
	addHistoryRecord(userId, history, function ()
	{
		return {
			category : "expiration"
		}
	})
}

// TODO change to use SocketStream approach
exports.getSettings = function (req, res)
{
	console.log("profile", exports.profile(req).settings)
	res.send(exports.profile(req).settings)
}

exports.postSettings = function (req, res)
{
	console.log("body", req.body)
	var p = exports.profile(req)
	if (!p) p = {}
	p.settings = req.body
	console.log("savingProfile", p)
	saveProfile(req, p)
	res.send('ok')
}

