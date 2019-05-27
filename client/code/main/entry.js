// patched for btca-frontend

/* eslint-env jquery */
'use strict'

const ss = require('socketstream')

ss.server.on('ready', function(){
	$(function(){
		// Load app
	})
})

$(function () {
	$('#tabs').tabs()	
	$('#why').tabs()
	$('#footer button').removeClass('ui-corner-all').width(16).height(16).css('margin-right', 7)
	$('#tab-configure').hide()
	$('#logout-button').button()
	$('#simpleopenid').simpleopenid()
	$('#simpleopenid input[type=submit]').button()
})
