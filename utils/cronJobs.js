const cron = require('node-cron');
const cryptoService = require('../services/cryptoService');

exports.startJobs = () => {
  cron.schedule('0 */2 * * *', async () => {
    console.log('Cron job triggered to fetch and store data');
    await cryptoService.fetchAndStoreData();
  });
};
