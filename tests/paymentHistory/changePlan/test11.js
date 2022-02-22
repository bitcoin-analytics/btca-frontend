var driver = require('../driver')

driver.runTest([
	{ action : 'createAccount', planName : '0.0075 monthly' }
,	{ action : 'changePlan', planName : '0.0125 bimonthly' }
,	{ action : 'payment', amount : 0.012 }
,	{ action : 'payment', amount : 0.0005 }
],
[ { category: 'changePlan',
    prevPlanName: '',
    planName: '0.0075 monthly',
    transaction_timestamp: 0 },
  { category: 'invoice',
    amount: -0.0075,
    planName: '0.0075 monthly',
    transaction_timestamp: 0 },
  { category: 'cancelInvoice',
    amount: 0.0075,
    planName: '0.0075 monthly',
    transaction_timestamp: 0 },
  { category: 'changePlan',
    prevPlanName: '0.0075 monthly',
    planName: '0.0125 bimonthly',
    transaction_timestamp: 0 },
  { category: 'invoice',
    amount: -0.0125,
    planName: '0.0125 bimonthly',
    transaction_timestamp: 0 },
  { category: 'receive',
    transaction_timestamp: 0,
    amount: 0.012,
    number_of_confirmations: '9',
    transaction_fee: '' },
  { category: 'receive',
    transaction_timestamp: 0,
    amount: 0.0005,
    number_of_confirmations: '9',
    transaction_fee: '' },
  { category: 'activation',
    duration_days: 60,
    transaction_timestamp: 0 }

])