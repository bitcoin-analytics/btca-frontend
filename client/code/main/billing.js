var ss = require('socketstream')

exports.confirmMigrationAddress = function(model)
{
	ss.rpc('billing.confirmBlockchainMigration', function (res)
	{
		if (!res.error)
		{
			model.set(res)
		}
		else
		{
			alert(res.error)
		}
	})
}

exports.createAddress = function (model, planName)
{
	ss.rpc('billing.createAddress', planName, function (res)
	{
		if (!res.error)
		{
			model.set(res)
		}
		else
		{
			alert(res.error)
		}
	})
}

exports.changePlan = function (model, planName)
{
	ss.rpc('billing.changePlan', planName, function (res)
	{
		if (!res.error)
		{
			model.set(res)
		}
		else
		{
			alert(res.error)
		}
	})
}

function isActivation(historyItem)
{
	return historyItem.category == "activation"
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

exports.lastActivation = function (paymentHistory)
{
	var lastActivationIdx = findLast(paymentHistory, isActivation)
	return lastActivationIdx != null ? paymentHistory[lastActivationIdx] : null
}
