var config = require('./config')
, assert = require('assert')

var https = require('https'),
querystring = require('querystring')
var crypto = require('crypto')
var user = require('./user')
, isoDate = require('../lib/isoDate')

var blockchainLog = require('./log').openLog('blockchainV2')

var satoshi = 1e-8

function get(hp, onResponse, err)
{
	blockchainLog.log('https get paramters', hp)
	//console.error('https get paramters', hp)
	var req = https.request(hp, function (response)
	{
		//console.error(response.statusCode)
		//console.error(response.headers)
		if (response.statusCode != 200) {
			readAll(response, function(data)
			{
				//console.error('statusCode='+response.statusCode, data)
				blockchainLog.log('statusCode='+response.statusCode, data)
				err('error response from payment provider while address creation')
			})
		}
		else
		{
			//console.error('request ok')
			readAll(response, onResponse)
		}
	})
	req.on('error', function (e)
	{
		console.error('error response from payment provider while address creation', e)
		blockchainLog.log('error response from payment provider while address creation', e)
		err('error response from payment provider while address creation')
	})
	req.end()
}

function readAll(stream, onResponse)
{
	stream.setEncoding('utf8')
	var body = '';
	stream.on('data', function (chunk) {
		//console.error('chunk')
		body += chunk
  	})

	stream.on('end', function () {
		//console.error('end')
		//console.error('body = ' + JSON.stringify(body))
		onResponse(body)
	})
}

exports.order = function (order, ok, err)
{
	//temporary disable new address generation
	//err('new address generation is disabled temporarily')
	//return


	//create random key
	var secretKey
	try {
		var buf = crypto.randomBytes(64);

		secretKey = buf.toString('base64')
	} catch (ex) {
		// handle error
		// most likely, entropy sources are drained
		console.error(ex.message)
		blockchainLog.log('most likely, entropy sources are drained', ex.message)
		err('payment system down!')
		return
	}


	var hmac = crypto.createHmac('sha256', new Buffer(secretKey, 'base64'))
	hmac.update(order)


	var callbackUrlJson = {
		customer_id : order,
		secret : hmac.digest('base64')
	}

	var requestJson = {
		xpub : config.blockchain2xPub,
		callback : 'http://'+config.httpHostname + '/billing/blockchain2/notify?' +querystring.stringify(callbackUrlJson),
		key : config.blockchain2APIKey
	}

	var hp = {
		host : 'api.blockchain.info',
		protocol: 'https:',
		method : 'GET',
		path : '/v2/receive?' + querystring.stringify(requestJson)}

try {
	get(hp, function (jsonBody)
	{
		try {
			var j = JSON.parse(jsonBody)
			//console.error('blockchain payment address requested!')
			blockchainLog.log('blockchain address ok', j)
			console.error(j)
			assert.ok(j.callback == requestJson.callback, 'callbak url is no equal')

			// TODO return complete JSON object
			ok(j.address, secretKey)
		} catch(e) {
			console.error(e)
			blockchainLog.log('payment processor response syntax error', e.message)
			err('payment processor response not regonized')
		}
	},
	err)

} catch(e) {
	console.error(e)
	console.error(e.stack)
}
}

exports.confirmMigration = function(userId, ok, err)
{
	var profile = user.profile(userId)
	console.error("profile", profile)

	if ('blockchainShowMigrationMessage' in profile)
	{
		delete profile.blockchainShowMigrationMessage
		profile.blockchainMigrationAcceptedOnDate = isoDate.timestamp()

		profile.save()
		ok(profile.clientProfile())
	}
	else
	{
		err()
	}

}

//var pn_example = { 'Payment Notification':
//   { category: 'receive',
//     transaction_timestamp: '1311264710',
//     signature: 'cee348aa2f6df8142faa9a84b6e2f04e745f1bb1b678db5b973902b3037f5040',
//     amount: '0.01',
//     foreign_order_id: 'http://moxorowich.myopenid.com/',
//     number_of_confirmations: '9',
//     order_status: 'satisfied',
//     transaction_fee: '',
//     bitcoin_address: '19iY5dyJz1RBz48gSFKiiSvp5mreMCVHht' } }
//

exports.notify = function (onPayment)
{
	return function (req, res)
	{
		console.error('exports.notify')
		console.error(req.query)
		var pn = req.query
		blockchainLog.log('callback notify', req.query)


		if(isSignatureCorrect(pn))// && pn.confirmations > 0)
		{
			var j = {
				foreign_order_id : pn.customer_id,
				category: 'receive',
				amount: pn.value * satoshi,
				transaction_hash: pn.transaction_hash
			}
			blockchainLog.log('onPayment', j)
			onPayment(j)
			res.end("*ok*")
		}
		else
		{
			res.end("!!!not ok! :(")
		}
	}
}

function isSignatureCorrect(j)
{
	var profile = user.profile(j.customer_id)

	if (!('blockchainSecret' in profile))
	{
		return false
	}

	//hmac
	var hmac = crypto.createHmac('sha256', new Buffer(profile.blockchainSecret, 'base64'))
	hmac.update(j.customer_id)


	if (hmac.digest('base64') == j.secret)
	{
		return true
	}

	return false
}

