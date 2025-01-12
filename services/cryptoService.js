const axios = require('axios');
const CryptoData = require('../models/CryptoData');

const fetchAndStoreCryptoData = async () => {
  const coins = ['bitcoin', 'matic-network', 'ethereum'];
  const baseURL = 'https://api.coingecko.com/api/v3/simple/price';
  
  try {
    const response = await axios.get(baseURL, {
      headers: {
        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
      },
      params: {
        ids: coins.join(','),
        vs_currencies: 'usd',
        include_market_cap: true,
        include_24hr_change: true
      }
    });

    const savedData = [];
    for (const coin of coins) {
      const coinData = response.data[coin];
      if (coinData) {
        const cryptoData = new CryptoData({
          coin,
          price: coinData.usd,
          marketCap: coinData.usd_market_cap,
          change24h: coinData.usd_24h_change
        });
        await cryptoData.save();
        savedData.push(cryptoData);
      }
    }
    
    console.log(`[Job] Successfully saved data for ${savedData.length} coins`);
    return savedData;
  } catch (error) {
    console.error('[Job] Error fetching crypto data:', error.message);
    throw error;
  }
};

const getLatestStats = async (coin) => {
  try {
    const latestData = await CryptoData.findOne({ coin })
      .sort({ timestamp: -1});
    
    if (!latestData) {
      throw new Error(`No data found for coin: ${coin}`);
    }

    return {
      price: latestData.price,
      marketCap: latestData.marketCap,
      "24hChange": latestData.change24h
    };
  } catch (error) {
    console.error('[Service] Error fetching latest stats:', error.message);
    throw error;
  }
};

const calculateDeviation = async (coin) => {
  try {
    const records = await CryptoData.find({ coin })
      .sort({ timestamp: -1 })
      .limit(100)
      .select('price');
    
    if (records.length === 0) {
      throw new Error(`No records found for coin: ${coin}`);
    }

    const prices = records.map(record => record.price);
    const mean = prices.reduce((acc, val) => acc + val, 0) / prices.length;
    const squaredDiffs = prices.map(price => Math.pow(price - mean, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / prices.length;
    const deviation = Math.sqrt(variance);

    return {
      deviation: Number(deviation.toFixed(2))
    };
  } catch (error) {
    console.error('[Service] Error calculating deviation:', error.message);
    throw error;
  }
};

module.exports = {
  fetchAndStoreCryptoData,
  getLatestStats,
  calculateDeviation
};