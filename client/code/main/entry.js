// patched for btca-frontend

/* eslint-env jquery */
'use strict'

const model2 = require('/modelNew').model
const ss = require('socketstream')
const model = require('/model')
console.log({'readystate' : document.readyState})

document.addEventListener('readystatechange', (event) => {
	console.log({'readystate' : document.readyState})
});
window.addEventListener('load', () => console.log('window.load'))

$(function () {
	console.log("jQuery $()")
	setTimeout(() => console.log("jQuery $() done"), 0)
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
	$('#logout-button').button()

	model.set({ status: 'Connecting'})

	ss.server.on('disconnect', function ()
	{
		model.set({ status: 'Reconnecting'})
	})

	ss.server.on('reconnect', function ()
	{
		model.set({ status: 'Reconnected'})
	})

	ss.server.on('ready', function ()
	{
		model.set({status: "Connected"})
	})
})
