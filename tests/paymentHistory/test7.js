var driver = require('./driver')

driver.runTest([
	{ action : 'createAccount', planName : '0.03 daily' }
,	{ action : 'expire', duration_days : 1 }
,	{ action : 'payment', amount : 0.03 }
,	{ action : 'expire', duration_days : 1 }
],
[ { category: 'changePlan',
    prevPlanName: '',
    planName: '0.03 daily',
    transaction_timestamp: 0 },
  { category: 'invoice', transaction_timestamp: 0, amount: -0.03, planName: '0.03 daily' },
  { category: 'receive',
    transaction_timestamp: driver.days(1),
    amount: 0.03,
    number_of_confirmations: '9',
    transaction_fee: '' }
,  { category: 'activation',
	   duration_days: 1,
	   transaction_timestamp: driver.days(1) }
,  { category: 'invoice', transaction_timestamp: driver.days(2), amount: -0.03, planName: '0.03 daily' }
,  { category: 'expiration', transaction_timestamp : driver.days(2) }
])