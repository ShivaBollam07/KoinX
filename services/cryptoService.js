const axios = require('axios');
const CryptoData = require('../models/CryptoData');

exports.fetchAndStoreData = async () => {
  const coins = ['bitcoin', 'matic-network', 'ethereum'];
  try {
    for (let coin of coins) {
      console.log(`Fetching data for: ${coin}`);
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: coin,
          vs_currencies: 'usd',
          include_market_cap: true,
          include_24hr_change: true,
        },
        headers: {
          'x-cg-demo-api-key': process.env.COINGECKO_API_KEY,
        },
      });

      if (!response.data || !response.data[coin]) {
        console.error(`No data found for ${coin}`);
        continue;
      }

      const data = response.data[coin];
      console.log(`Data fetched for ${coin}:`, data);

      const newCryptoData = new CryptoData({
        coin,
        price: data.usd,
        marketCap: data.usd_market_cap,
        change24h: data.usd_24h_change,
      });

      await newCryptoData.save();
      console.log(`Data for ${coin} saved to MongoDB!`);
    }
  } catch (error) {
    console.error('Error fetching data from CoinGecko:', error.message);
  }
};
