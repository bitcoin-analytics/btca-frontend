var driver = require('./driver')

driver.runTest([
	{ action : 'createLegacyAccount' }
,	{ action : 'payment', amount : 0.4 }
,	{ action : 'expire', duration_days : 1 }
,	{ action : 'payment', amount : 1 } // generate first activation since account creation (after payment)
,	{ action : 'expire', duration_days : 29 } // test of normal non-legacy non-expiration
,	{ action : 'legacyExpireAndReactivate', duration_days : 1 } // generate legacy reactivation sequence
,	{ action : 'expire', duration_days : 30 } //  test normal non-legacy expiration (default plan is assigned)
],
[ { category: 'invoice', transaction_timestamp: 0, amount: -0.5 },
 { category: 'receive',
   transaction_timestamp: 0,
   amount: 0.4,
   number_of_confirmations: '9',
   transaction_fee: '' },
 // generate first activation since account creation (after payment)
 { category: 'receive',
   transaction_timestamp: driver.days(1),
   amount: 1,
   number_of_confirmations: '9',
   transaction_fee: '' },
 { category: 'activation',
   duration_days: 30,
   transaction_timestamp: driver.days(1) },
 // legacy reactivation sequence
 { category: 'invoice',
   transaction_timestamp: driver.days(31),
   amount: -0.5 },
 { category: 'activation',
   duration_days: 30,
   transaction_timestamp: driver.days(31) },

 // normal non-legacy expiration
 { category: 'invoice',
   transaction_timestamp: driver.days(61),
   planName : '0.5 monthly',
   amount: -0.5 },
 { category: 'expiration', transaction_timestamp: driver.days(61) }
])