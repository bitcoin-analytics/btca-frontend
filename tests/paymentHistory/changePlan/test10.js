var driver = require('../driver')

driver.runTest([
	{ action : 'createLegacyAccount' }
,	{ action : 'expire', duration_days : 1 }
,	{ action : 'payment', amount : 0.5 }
,	{ action : 'payment', amount : 0.01 }
,	{ action : 'legacyExpire', duration_days : 30 }
,	{ action : 'expire', duration_days : 30 }
,	{ action : 'changePlan', planName : '0.01 daily' }
,	{ action : 'payment', amount : 0.01 }
],
[ { category: 'invoice', transaction_timestamp: 0, amount: -0.5 },
  { category: 'receive',
    transaction_timestamp: 86400,
    amount: 0.5,
    number_of_confirmations: '9',
    transaction_fee: '' },
  { category: 'activation',
    duration_days: 30,
    transaction_timestamp: 86400 },
  { category: 'receive',
    transaction_timestamp: 86400,
    amount: 0.01,
    number_of_confirmations: '9',
    transaction_fee: '' },
  { category: 'invoice',
    transaction_timestamp: 2678400,
    amount: -0.5 },
  { category: 'expiration', transaction_timestamp: 2678400 },
  { category: 'cancelInvoice',
    amount: 0.5,
    planName: '0.5 monthly',
    transaction_timestamp: 5270400 },
  { category: 'changePlan',
    prevPlanName: '0.5 monthly',
    planName: '0.01 daily',
    transaction_timestamp: 5270400 },
  { category: 'invoice',
    amount: -0.01,
    planName: '0.01 daily',
    transaction_timestamp: 5270400 },
  { category: 'activation',
    duration_days: 1,
    transaction_timestamp: 5270400 },
  { category: 'receive',
    transaction_timestamp: 5270400,
    amount: 0.01,
    number_of_confirmations: '9',
    transaction_fee: '' }
])
