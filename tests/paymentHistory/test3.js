require('./driver').runTest([
	{ action : 'createLegacyAccount' }
,	{ action : 'payment', amount : 0.4 }
,	{ action : 'expire', duration_days : 40 }
],
[ { category: 'invoice', transaction_timestamp: 0, amount: -0.5 },
  { category: 'receive',
    transaction_timestamp: 0,
    amount: 0.4,
    number_of_confirmations: '9',
    transaction_fee: '' } ]
)