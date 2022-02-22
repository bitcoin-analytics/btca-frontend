var driver = require('../driver')

driver.runTest([
	{ action : 'createLegacyAccount' }
,	{ action : 'expire', duration_days : 1 }
,	{ action : 'payment', amount : 0.5 }
,	{ action : 'changePlan', planName : '0.03 daily' }
,	{ action : 'expire', duration_days : 31 }
],
[ { category: 'invoice', transaction_timestamp: 0, amount: -0.5 },
  { category: 'receive',
    transaction_timestamp: driver.days(1),
    amount: 0.5,
    number_of_confirmations: '9',
    transaction_fee: '' },
  { category: 'activation',
    duration_days: 30,
    transaction_timestamp: driver.days(1) }
, { category: 'changePlan', transaction_timestamp: driver.days(1), prevPlanName : '0.5 monthly', planName : '0.03 daily' }
, { category: 'invoice',
	  transaction_timestamp: driver.days(31),
	  planName: '0.03 daily',
	  amount: -0.03 }
, { category: 'expiration', transaction_timestamp: driver.days(31) }
])