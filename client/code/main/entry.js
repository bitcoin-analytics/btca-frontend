// patched for btca-frontend
'use strict';

const ss = require('socketstream')

ss.server.on('ready', function(){
  $(function(){
    // Load app
  });
});

$(function () {
	$('#tabs').tabs()	
	$('#why').tabs()
	$('#tab-configure').hide()
})
