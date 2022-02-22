try {

var user = require('../lib/user')
,	billingBlockchain = require('../lib/billingBlockchainV2')
,	auth = require('../middleware/example').authenticated
, config = require('../lib/config')
, isoDate = require('../lib/isoDate')

var blockchainLog = require('../lib/log').openLog('blockchainV2')

var debugAddress = config.enablePayflowDebugAddress

exports.actions = function (req, res)
{
	req.use('session')
	req.use(auth)
	return {
		confirmBlockchainMigration : function()
		{
			blockchainLog.log("confirmBlockchain Migration Address!")
			blockchainLog.log("user:", req.session.userId)

			var profile = user.profile(req.session.userId)

			if ('blockchainShowMigrationMessage' in profile)
        		{
				billingBlockchain.order(req.session.userId, function (address, secretKey)
                                {
                			if(address)
					{
						blockchainLog.log("Migration new address ok", address)
						profile.blockchainSecret = secretKey
						profile.bitcoinAddress = address

						delete profile.blockchainShowMigrationMessage
						profile.blockchainMigrationAcceptedOnDate = isoDate.timestamp()
						profile.save()
						res({profile : profile.clientProfile()})
					}
					else
					{
						blockchainLog.log("Migration new address not ok")
						res({ error : 'payment subsystem is down' })
					}
				},
				function(message)
				{
					blockchainLog.log('error', message)
					res({ error : message })
				})
			}
		        else
		        {
		                res({ error : 'Account address migration is already confirmed for this account!' })
		        }
			//billingBlockchain.confirmMigration(req.session.userId, function(clientProfile)
			//{
			//	res({profile : clientProfile})
			//},
			//function()
			//{
			//	res({ error : 'Account address migration is already confirmed for this account!' })
			//})
		}
	,	changePlan : function (planName)
		{
			if (!config.enabledPlans.hasOwnProperty(planName))
			{
				res({ error : "'" + planName + '\' is an invalid plan name' })
				return
			}
	   		var profile = user.profile(req.session.userId)

			if (profile.clientProfile().currentPlanName == planName)
			{
				res({ error : "'" + planName + '\' is already current plan name' })
			   return
			}
			user.changePlan(req.session.userId, profile, planName)

			profile.save()
			res({profile : profile.clientProfile()})
		}
	,	createAddress : function (planName)
		{
		   	if (!config.enabledPlans.hasOwnProperty(planName))
			{
			   res({ error : "'" + planName + '\' is an invalid plan name' })
			   return
			}

			console.error("createAddress!")
			console.error("user:", req.session.userId)
			var profile = user.profile(req.session.userId)
			console.error("profile", profile)

			if (!debugAddress && profile.bitcoinAddress)
			{
				res({ error : 'multiple addresses are not allowed' })
			}
			else
			{
				blockchainLog.log(req.session.userId)
				billingBlockchain.order(req.session.userId, function (address, secretKey)
				{
					blockchainLog.log(req.session.userId, address, secretKey)
					console.error("order init")
					if (address)
					{
						console.error("address ok", address)
						try {
						profile.blockchainSecret = secretKey
						user.createAccount(req.session.userId, profile, address, planName)
						profile.save()
						res({profile : profile.clientProfile()})
						} catch (e)
						{
						   console.error(e)
						   console.error(e.stack)
						}
					}
					else
					{
						res({ error : 'payment subsystem is down' })
					}
				},
				function(message)
				{
					blockchainLog.log('error', req.session.userId, message)
					console.error('error', req.session.userId, message)
					res({ error : message })
				})
			}
		}
	}
}

} catch (e)
{
   console.log("exception in bill")
   console.log(e.stack)
}
