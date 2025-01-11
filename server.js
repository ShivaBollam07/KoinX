const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cron = require('node-cron');
require('dotenv').config(); // Load environment variables from .env file

// Create Express app
const app = express();
const port = 3000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  connectTimeoutMS: 30000,
})
  .then(() => console.log('[MongoDB] Connected successfully'))
  .catch((err) => console.error('[MongoDB] Connection error:', err));

// Define schema for storing crypto data
const cryptoSchema = new mongoose.Schema({
  coinId: { type: String, required: true },
  price: { type: Number, required: true },
  marketCap: { type: Number, required: true },
  change24h: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const CryptoData = mongoose.model('CryptoData', cryptoSchema);

// Function to fetch and store crypto data
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

// Trigger data fetch immediately on server start
console.log('[Server] Starting immediate data fetch for initial testing');
fetchAndStoreCryptoData().then(() => {
  console.log('[Server] Initial data fetch completed');
}).catch(err => {
  console.error('[Server] Error during initial data fetch:', err.message);
});

// Schedule the background job to run every 2 hours
cron.schedule('0 */2 * * *', async () => {
  console.log('[Cron Job] Triggered: Fetching crypto data');
  await fetchAndStoreCryptoData();
  console.log('[Cron Job] Completed: Data fetch');
});

// API to get the latest data for a cryptocurrency
app.get('/stats', async (req, res) => {
  const coin = req.query.coin;

  if (!coin) {
    return res.status(400).json({ error: 'Coin parameter is required' });
  }

  try {
    const data = await CryptoData.find({ coinId: coin }).sort({ timestamp: -1 }).limit(1);

    if (data.length === 0) {
      return res.status(404).json({ error: `No data found for coin: ${coin}` });
    }

    const latestData = data[0];
    res.json({
      coinId: latestData.coinId,
      price: latestData.price,
      marketCap: latestData.marketCap,
      change24h: latestData.change24h,
    });
  } catch (error) {
    console.error('[API] Error fetching data from MongoDB:', error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// API to calculate standard deviation of price for the last 100 records of a cryptocurrency
app.get('/deviation', async (req, res) => {

  const  coinId  = req.query.coin;

  try {
    // Fetch the last 100 records for the requested cryptocurrency
    const records = await CryptoData.find({ coinId })
      .sort({ timestamp: -1 })
      .limit(100);

    if (records.length === 0) {
      return res.status(404).json({ error: `No records found for cryptocurrency: ${coinId}` });
    }

    // Extract prices from the records
    const prices = records.map(record => record.price);

    // Calculate the mean
    const mean = prices.reduce((acc, price) => acc + price, 0) / prices.length;

    // Calculate the variance
    const variance = prices.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) / prices.length;

    // Calculate the standard deviation
    const standardDeviation = Math.sqrt(variance);

    // Respond with the result
    res.json({
      coinId,
      standardDeviation: standardDeviation.toFixed(2), // Format to 2 decimal places
      recordsCount: prices.length,
    });
  } catch (error) {
    console.error('[API] Error calculating standard deviation:', error.message);
    res.status(500).json({ error: 'Failed to calculate standard deviation' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`[Server] Running on http://localhost:${port}`);
});
