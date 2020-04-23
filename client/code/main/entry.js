// patched for btca-frontend

/* eslint-env jquery */
'use strict'

const model2 = require('/modelNew').model
const ss = require('socketstream')
const bench = require('/benchmark').log
const model = require('/model')
console.log({'readystate' : document.readyState})

document.addEventListener('readystatechange', () => {
	console.log({'readystate' : document.readyState})
})
window.addEventListener('load', () => console.log('window.load'))

function update_stats(uptime)
{
	$('#uptime').text(uptime)
}

function onAppInit(f)
{
	bench.start('onAppInit')

	update_stats(f.uptime)

	model2.set('general-ui.isSubscribed', f.isSubscribed)
	model.set({
		nickname : f.nickname
	, 	profile : f.profile
	,	isEveryAuthError : f.isEveryAuthError
	,	isSubscribed : f.isSubscribed
	})

	model.set({status: "Receiving chart data"})
	bench.stop('onAppInit')
	
	model2.set('general-ui.appInitFinished', true)
}

function onReconnectAppInit(f)
{
	bench.start('onReconnectAppInit')

	update_stats(f.uptime)

	model2.set('arbitrage.btcAll', f.btcAll)
	model.set({
		nickname : f.nickname
	, 	profile : f.profile
	,	isSubscribed : f.isSubscribed
	})

	model2.set('general-ui.isSubscribed', f.isSubscribed)
	
	bench.stop('onReconnectAppInit')
}


$(function () {
	console.log('jQuery $()')
	setTimeout(() => console.log('jQuery $() done'), 0)
	_gaq.push(['_trackEvent', 'Init', 'Init Start', 'Init Start $', 0, true])
	model2.set('general-ui.isSubscribed', false)
	model2.set('general-ui.init', true)
	$('#tabs').tabs()
	$('#why').tabs()
	$('#footer button').removeClass('ui-corner-all').width(16).height(16).css('margin-right', 7)
	$('#simpleopenid').simpleopenid()
	$('#simpleopenid input[type=submit]').button()

	$('#tab-login').hide()
	$('#tab-configure').hide()

	$('#logout-button').button().click(function()
	{
		ss.rpc('app.logout', function(){
			document.location.reload()
		})
	})



	model.set({ status: 'Connecting'})

	ss.server.on('disconnect', function ()
	{
		model.set({ status: 'Reconnecting'})
	})

	ss.server.on('reconnect', function ()
	{
		model.set({ status: 'Reconnected'})
		ss.rpc('app.initReconnect', function(x)
		{
			model2.set('ss-event.reconnect',x )
			onReconnectAppInit(x)
		})
	})

	ss.server.on('ready', function ()
	{
		model.set({status: 'Connected'})
		console.log('app.init request')
		console.log("App")
		ss.rpc('app.init', function(x)
		{
			model2.set('ss-event.appInit', x)
			onAppInit(x)
		})
		console.log('ready finished')
	})
})
