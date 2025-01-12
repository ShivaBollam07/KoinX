const cron = require('node-cron');
const cryptoService = require('../services/cryptoService');

const startCronJobs = () => {
  cron.schedule('0 */2 * * *', async () => {
    console.log('[Cron] Starting cryptocurrency data fetch');
    try {
      await cryptoService.fetchAndStoreCryptoData();
      console.log('[Cron] Successfully completed data fetch');
    } catch (error) {
      console.error('[Cron] Error during data fetch:', error.message);
    }
  });
};

module.exports = { startCronJobs };