const axios = require('axios');
const CryptoData = require('../models/CryptoData');

const fetchAndStoreCryptoData = async () => {
  const coins = ['bitcoin', 'matic-network', 'ethereum'];
  console.log('[Job] Starting data fetch for coins:', coins);

  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      headers: {
        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY,
      },
      params: {
        vs_currencies: 'usd',
        ids: coins.join(','), // Comma-separated list of coin IDs
        include_market_cap: 'true',
        include_24hr_change: 'true',
      },
    });

    console.log('[Job] Data fetched from CoinGecko:', response.data);

    // Save data for each coin to MongoDB
    for (let coin of coins) {
      const data = response.data[coin];

      if (!data) {
        console.error(`[Job] No data found for coin: ${coin}`);
        continue;
      }

      console.log(`[Job] Data for ${coin}:`, data);

      const newCryptoData = new CryptoData({
        coinId: coin,
        price: data.usd,
        marketCap: data.usd_market_cap,
        change24h: data.usd_24h_change,
      });

      await newCryptoData.save();
      console.log(`[MongoDB] Data for ${coin} saved successfully!`);
    }
  } catch (error) {
    console.error('[Job] Error fetching data from CoinGecko:', error.message);
  }
};

module.exports = {
  fetchAndStoreCryptoData,
};
