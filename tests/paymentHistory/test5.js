var driver = require('./driver')

driver.runTest([
	{ action : 'createAccount', planName : '0.5 monthly' }
,	{ action : 'expire', duration_days : 1 }
,	{ action : 'payment', amount : 0.5 }
,	{ action : 'expire', duration_days : 31 }
],
[ { category: 'changePlan',
    prevPlanName: '',
    planName: '0.5 monthly',
    transaction_timestamp: driver.days(0) },
  { category: 'invoice', transaction_timestamp: 0, amount: -0.5, planName: '0.5 monthly' },
  { category: 'receive',
    transaction_timestamp: driver.days(1),
    amount: 0.5,
    number_of_confirmations: '9',
    transaction_fee: '' },
  { category: 'activation',
    duration_days: 30,
    transaction_timestamp: driver.days(1) },
  { category: 'invoice',
    planName: '0.5 monthly',
    transaction_timestamp: driver.days(31),
    amount: -0.5 },
  { category: 'expiration', transaction_timestamp: driver.days(31) }
])