const R = require('ramda');

const investmetService = require('./investmentService');
const financialService = require('./financialService');
const memoize = require('../helpers/memoize');



// We can have this as [{ key: header }, ...] but it is more convinient to use it separately here
const csvHeaders = ['User', 'First Name', 'Last Name', 'Date', 'Holding', 'Value'];
const csvKeys = ['userId', 'firstName', 'lastName', 'date', 'holdings', 'value'];

const getHoldingName = async (id) => {
  const company = await financialService.getCompany(id)
  console.log(company)
  return company ? company.name : '';
}

const createReport = async () => {
  const investments = await investmetService.get();

  // Flat 'holdings' field array
  const reportData = R.compose(
    R.flatten,
    R.map(R.unwind('holdings')),
  )(investments);

  return generateCSV(reportData, csvKeys, csvHeaders)
};

const getHandlers = () => {
  const holdings = memoize(data => getHoldingName(data.holdings.id),
    { promise: true, normalizer: args => args[0]?.holdings?.id }
  )

  const keyGetter = (key) => (data) => data[key];

  return {
    userId: keyGetter('userId'),
    firstName: keyGetter('firstName'),
    lastName: keyGetter('lastName'),
    date: keyGetter('date'),
    holdings,
    value: (data) => data.investmentTotal * data.holdings.investmentPercentage
  }
}

const generateCSV = async (reportData, keys, headers) => {
  const reportKeyHandlers = getHandlers();

  // We can do any check for keys and its handlers
  const mapRowKey = (key, row) => reportKeyHandlers[key] ? reportKeyHandlers[key](row) : undefined;
  const mapRow = row => Promise.all(R.map((key) => mapRowKey(key, row), keys))

  const reportRows = await Promise.all(R.map(mapRow)(reportData))
  const reduceRow = (acc, row) => acc + '\n' + row.toString();

  return R.reduce(reduceRow, headers.toString())(reportRows)
}

module.exports = createReport;