var driver = require('../driver')

driver.runTest([
	{ action : 'createLegacyAccount' }
,	{ action : 'expire', duration_days : 1 }
,	{ action : 'payment', amount : 0.5 }
,	{ action : 'legacyExpire', duration_days : 30 }
,	{ action : 'expire', duration_days : 2 }
,	{ action : 'changePlan', planName : '0.03 daily' }
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
, { category: 'invoice', transaction_timestamp: driver.days(31), amount: -0.5, planName: '0.5 monthly' }
, { category: 'expiration', transaction_timestamp: driver.days(31) }
, { category: 'cancelInvoice', transaction_timestamp: driver.days(33), amount: 0.5, planName : '0.5 monthly' }
, { category: 'changePlan', transaction_timestamp: driver.days(33), prevPlanName : '0.5 monthly', planName : '0.03 daily' }
, { category: 'invoice',
	  transaction_timestamp: driver.days(33),
	  planName: '0.03 daily',
	  amount: -0.03 }
])
