require('./driver').runTest([
	{ action : 'createLegacyAccount' }
,	{ action : 'payment', amount : 0.5 }
,	{ action : 'expire', duration_days : 29 }
],
[ { category: 'invoice', transaction_timestamp: 0, amount: -0.5 },
  { category: 'receive',
    transaction_timestamp: 0,
    amount: 0.5,
    number_of_confirmations: '9',
    transaction_fee: '' },
  { category: 'activation',
    duration_days: 30,
    transaction_timestamp: 0 }
])