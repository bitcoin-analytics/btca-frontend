var depth = require('./depthAPI')
var set = require('./util/set')
var map = require('./util/map')

var apiParams = depth.apiParams

var curTickers = {}
for (var ticker in apiParams)
{
	var cur = apiParams[ticker].cur
	if(!curTickers[cur])
	{
		curTickers[cur] = []
	}
	curTickers[cur].push(ticker)
}


exports.currencyTickers = function ()
{
	return curTickers
}

exports.allTickers = function()
{
	return Object.keys(apiParams)
}

exports.tickerCurrency = function(ticker)
{
	if(apiParams[ticker])
	{
		return apiParams[ticker].cur
	}
	//console.log("exchange ticker not found in api: ticker "+ticker)
	return ''
}

exports.currenciesToFetch = []

exports.array2hashOfTrue = function (a)
{
	var h = {}
	a.forEach(function (x)
	{
		h[x] = true
	})
	return h
}

exports.makeTickersToFetch = function (enabledCurrencies, disabledTickers)
{
	var tickerSet = set.fromList(disabledTickers)
	var currencySet = set.fromList(enabledCurrencies)

	return map.forEach(apiParams, function (ticker, params, emit)
	{
		if (currencySet.elem(params.cur) && !tickerSet.elem(ticker))
		{
			emit(ticker)
		}
	})
}

exports.makeClientCurrencyTickers = function (enabledCurrencies, disabledTickers)
{
	var tickerSet = set.fromList(disabledTickers)
	var currencySet = set.fromList(enabledCurrencies)

	var out = {}
	for (var ticker in apiParams)
	{

		if (currencySet.elem(apiParams[ticker].cur) && !tickerSet.elem(ticker))
		{
			if (apiParams[ticker].cur in out)
			{
				out[apiParams[ticker].cur].push(ticker)
			}
			else
			{
				out[apiParams[ticker].cur] = [ticker]
			}
		}
	}
	return out
}

exports.isTickerFree = function (freeTickerList)
{
	var freeTickerSet = set.fromList(freeTickerList)
	return freeTickerSet.member.bind(freeTickerSet)
}
