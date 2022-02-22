var driver = require('../driver')

driver.runTest([
	{ action : 'createLegacyAccount' }
,	{ action : 'expire', duration_days : 1 }
,	{ action : 'changePlan', planName : '0.03 daily' }
,	{ action : 'changePlan', planName : '0.5 monthly' }
],
[ { category: 'invoice', transaction_timestamp: 0, amount: -0.5 }
, { category: 'cancelInvoice', transaction_timestamp: driver.days(1), amount: 0.5, planName : '0.5 monthly' }
, { category: 'changePlan', transaction_timestamp: driver.days(1), prevPlanName : '0.5 monthly', planName : '0.03 daily' }
, { category: 'invoice',
    transaction_timestamp: driver.days(1),
	planName: '0.03 daily',
    amount: -0.03 }
, { category: 'cancelInvoice', transaction_timestamp: driver.days(1), amount: 0.03, planName : '0.03 daily' }
, { category: 'changePlan', transaction_timestamp: driver.days(1), prevPlanName : '0.03 daily', planName : '0.5 monthly' }
, { category: 'invoice',
    transaction_timestamp: driver.days(1),
	planName: '0.5 monthly',
    amount: -0.5 }
]
)