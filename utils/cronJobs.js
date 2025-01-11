const cron = require('node-cron');
const cryptoService = require('../services/cryptoService');

const startCronJobs = () => {
  cron.schedule('0 */2 * * *', async () => {
    console.log('[Cron Job] Triggered: Fetching crypto data');
    await cryptoService.fetchAndStoreCryptoData();
    console.log('[Cron Job] Completed: Data fetch');
  });
};

module.exports = { startCronJobs };
