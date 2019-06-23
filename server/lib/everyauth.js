var
	everyauth = require('everyauth')
,	util = require('util')
, oauth = require('./everyauth_modules/oauth')
, linkedin = require('./everyauth_modules/linkedin')
, vkontakte = require('./everyauth_modules/vkontakte')
, google = require('./everyauth_modules/google')
, config = require('./config')

exports.everyauth = everyauth

everyauth.everymodule
	.moduleErrback( function (err) {
		console.error('General everyauth error', err)
	})
	//.moduleTimeout(1000);
	
everyauth.facebook
	.appId(config.everyauth.facebook.appId)
	.appSecret(config.everyauth.facebook.appSecret)
	.findOrCreateUser( function (session, accessToken, accessTokExtra, fbUserMetadata) {
		var promise = this.Promise()
		oauth.findOrCreateFacebookUser(session, fbUserMetadata, promise)
    // find or create user logic goes here
		//console.log(util.inspect(fbUserMetadata))
		
		return promise
  })
	.handleAuthCallbackError( oauth.handleAuthFacebookCallbackError )
	.moduleErrback( oauth.handleAuthFacebookModuleError )
  .redirectPath('/')
	
everyauth
	.twitter
		.consumerKey(config.everyauth.twitter.consumerKey)
		.consumerSecret(config.everyauth.twitter.consumerSecret)
		.findOrCreateUser( function (session, accessToken, accessTokenSecret, twitterUserMetadata) {
			// find or create user logic goes here
			var promise = this.Promise()
			oauth.findOrCreateTwitterUser(session, twitterUserMetadata, promise)
			// find or create user logic goes here
			//console.log(util.inspect(twitterUserMetadata))
			
			return promise
		})
		.handleAuthCallbackError( oauth.handleAuthTwitterCallbackError )
		.moduleErrback( oauth.handleAuthTwitterModuleError )
		.redirectPath('/');	

everyauth
	.openid
		.myHostname('http://'+config.httpHostname)
		.attributeExchange({
			"http://axschema.org/contact/email": "required",
			"http://axschema.org/namePerson/friendly": "required",
			"http://axschema.org/namePerson": "required"
		})
		.simpleRegistration({})
		//.openidURLField('openid_identifier')
		.findOrCreateUser( function(session, openidUserMetadata) {
			var promise = this.Promise()
			oauth.findOrCreateOpenidUser(session, openidUserMetadata, promise)
			// find or create user logic goes here
			//console.log(util.inspect(openidUserMetadata))
			
			return promise
		})
		//.handleAuthCallbackError( oauth.handleAuthOpenidCallbackError )
		.moduleErrback( oauth.handleAuthOpenidModuleError )
		.redirectPath('/')
		.callbackPath('/openid/verify')
		
everyauth.linkedin
	.consumerKey(config.everyauth.linkedin.consumerKey)
	.consumerSecret(config.everyauth.linkedin.consumerSecret)
	.findOrCreateUser( function (session, accessToken, accessTokExtra, linkedinUserMetadata) {
		var promise = this.Promise()
		linkedin.findOrCreateLinkedinUser(session, linkedinUserMetadata, promise)
    // find or create user logic goes here
		//console.log(util.inspect(fbUserMetadata))
		
		return promise
  })
	.handleAuthCallbackError( linkedin.handleAuthLinkedinCallbackError )
	.moduleErrback( linkedin.handleAuthLinkedinModuleError )
  .redirectPath('/')

everyauth.vkontakte
	.appId(config.everyauth.vkontakte.appId)
	.appSecret(config.everyauth.vkontakte.appSecret)
	.findOrCreateUser( function (session, accessToken, accessTokExtra, linkedinUserMetadata) {
		var promise = this.Promise()
		vkontakte.findOrCreateVkontakteUser(session, linkedinUserMetadata, promise)
    // find or create user logic goes here
		//console.log(util.inspect(fbUserMetadata))
		
		return promise
  })
	.handleAuthCallbackError( vkontakte.handleAuthVkontakteCallbackError )
	.moduleErrback( vkontakte.handleAuthVkontakteModuleError )
  .redirectPath('/')

everyauth.google
  .appId(config.everyauth.google.clientId)
  .appSecret(config.everyauth.google.clientSecret)
  .scope('https://www.googleapis.com/auth/plus.profile.emails.read') // What you want access to
	.authQueryParam({ access_type:'online', approval_prompt:'auto' })
  .handleAuthCallbackError( google.handleAuthGoogleCallbackError)
  .findOrCreateUser( function (session, accessToken, accessTokenExtra, googleUserMetadata) {
    // find or create user logic goes here
    // Return a user or Promise that promises a user
    // Promises are created via
    var promise = this.Promise();
		
		google.findOrCreateGoogleUser(session, googleUserMetadata, promise)
		
		return promise
  })
	.moduleErrback( google.handleAuthGoogleModuleError )
	.callbackPath('/auth/google/oauth2callback')
  .redirectPath('/');
