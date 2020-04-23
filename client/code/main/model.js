var	billing = require('/billing')
const map = require('/map')
const config ={}
var model = new Backbone.Model()

var debugAddress = config.enablePayflowDebugAddress

model.on('change:nickname', function (model, nickname)
{
	if (typeof nickname == 'string')
	{
		$('#tab-login').hide(1500)
		$('#tab-configure').show()
		$('#user').text("Logged in as " + nickname.slice(0, 25))
	}
	else
	{
		$('#tab-login').show(1500)
		$('#tab-configure').hide(1500)
		$('#user').text("Not logged in")
	}
})

model.on('change:last_updated', function (model, last_updated)
{
	$('#last_updated').text(last_updated)
})

function forceNone(x)
{
	x.css('display', 'none')
}

function forceBlock(x)
{
	x.css('display', 'block')
}

model.on('change:status', function (model, status)
{
	if (status == 'ok')
	{
		var nickname = model.get("nickname")
		if (typeof nickname == 'string')
		{
			$('#user').text("Logged in as " + nickname.slice(0, 25))
		}
		else
		{
			$('#user').text("Not logged in")
		}
		return
	}
	$('#user').text(status)
})

function addDays(ts, days)
{
	console.log('addDays')
	console.log(ts, days)
	return new Date((ts + 86400 * days) * 1000)
}

var satoshi = 1e-8

function calcBalance(paymentHistory)
{
	var balance = 0
	paymentHistory
		.filter(function (x) { return x.transaction_timestamp })
		.forEach(function (item)
	{
		item.isPayment = item.category == 'receive'
		if (item.amount)
		{
			balance += parseFloat(item.amount)
		}

		item.balance = (balance > -satoshi && balance < 0) ? parseFloat('0.0').toFixed(4) : balance.toFixed(4)
	})
		
	return balance > -satoshi && balance < 0 ? 0.0 : balance
}
		
function createButtonsCreateAccount()
{
	map.forEachSorted(config.enabledPlans, function (planName, planOptions)
	{
		$('<button>', { text : planOptions.createAccountButtonText })
			.appendTo('#configure-buttons-div')
			.button()
			.click(function ()
			{
				$('button', '#configure-buttons-div').button('option', 'disabled', true)
				billing.createAddress(model, planName)
			})
	})
}
			
function createButtonsChangePlan(profile)
{
	map.forEachSorted(config.enabledPlans, function (planName, planOptions)
	{
		if (planName != profile.currentPlanName)
		{
			$('<button>', { text : planOptions.createAccountButtonText })
				.appendTo('#configure-buttons-div')
				.button()
				.click(function ()
				{
					billing.changePlan(model, planName)
				})
		}
	})
}

model.on('change:profile', function (model, profile)
{
	if(!profile.paymentHistory) return

	var balance = calcBalance(profile.paymentHistory)
	/* Render the template with the movies data */
	$( "#tmpl-main-billing-history" ).tmpl({
		profile : profile
	}).appendTo( $("#configure-history").empty() )
	
	if (profile.bitcoinAddress)
	{
		createButtonsChangePlan(profile)
	}
	else
	{
		createButtonsCreateAccount()
	}
	
	if ('blockchainShowMigrationMessage' in profile)
	{
		$('#marketcharts-address-migration-warning').css('display', 'block')
		$('#configure-address-migration-warning').css('display', 'block')
		//hide change plan buttons if migration is not confirmed
		$('#configure-buttons-div').css('display', 'none')
		
		$('<button>', { text : 'I confirm' })
				.appendTo('#configure-confirm-migration')
				.button()
				.click(function ()
				{
					$('button', '#configure-confirm-migration').button('option', 'disabled', true)
					billing.confirmMigrationAddress(model)
				})
	}
	else
	{
		$('#marketcharts-address-migration-warning').css('display', 'none')
		$('#configure-address-migration-warning').css('display', 'none')
		$('#configure-buttons-div').css('display', 'block')
	}

	$('#configure-balance').text(balance.toFixed(4))

	if (balance < 0)
	{
		// TODO investigate why .hide() and .show() don't work here and fix
		$('#balance-warning').css('display', 'block')
		$('.neg-balance').text((-balance).toFixed(4))
	}
	else
	{
		$('#balance-warning').css('display', 'none')
	}
	
	var a = billing.lastActivation(profile.paymentHistory)
	if (a == null)
	{
		$('#configure-subscription-status').text('Was never activated')
	}
	else
	{
		var expiration = addDays(a.transaction_timestamp, a.duration_days)
 		if (balance < 0)
		{
			$('#configure-subscription-status').text('Inactive. Expired on ' + expiration.toDateString() + '')
		}
		else
		{
			$('#configure-subscription-status').text('Active. Expires on ' + expiration.toDateString() + '')
		}

	}
})

model.on('change:isSubscribed', function (model, isSubscribed)
{
	if (isSubscribed )
	{
		$('#arbitrage-warning').css('display', 'none')
		$('#depthcharts-warning').css('display', 'none')

		$('#marketcharts-warning').css('display', 'none')
	}
	else
	{
		$('#arbitrage-warning').css('display', 'block')
		!('blockchainShowMigrationMessage' in model.attributes.profile) && $('#marketcharts-warning').css('display', 'block')
		$('#depthcharts-warning').css('display', 'block')
	}
})

model.on('change:isEveryAuthError', function(model, isError)
{
	if(isError) alert(isError.message)
})

exports.model = model
exports.set = function (x) { model.set(x) }
