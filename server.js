const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cron = require('node-cron');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  
  connectTimeoutMS: 30000, 
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const cryptoSchema = new mongoose.Schema({
  coin: String,
  price: Number,
  marketCap: Number,
  change24h: Number,
  timestamp: { type: Date, default: Date.now },
});

const CryptoData = mongoose.model('CryptoData', cryptoSchema, 'cryptodatas');

const fetchAndStoreData = async () => {
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

fetchAndStoreData();

cron.schedule('0 */2 * * *', async () => {
  console.log('Cron job triggered to fetch and store data');
  await fetchAndStoreData();
});

app.get('/stats', async (req, res) => {
  const coin = req.query.coin;
  if (!coin) {
    return res.status(400).send('Coin parameter is required');
  }

  try {
    const data = await CryptoData.find({ coin }).sort({ timestamp: -1 }).limit(1);
    if (data.length === 0) {
      return res.status(404).send('Data not found for the requested coin');
    }

    const latestData = data[0];
    return res.json({
      price: latestData.price,
      marketCap: latestData.marketCap,
      "24hChange": latestData.change24h,
    });
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error.message);
    return res.status(500).send('Error fetching data from MongoDB');
  }
});



app.get('/deviation', async (req, res) => {
  const coin = req.query.coin;
  if (!coin) {
    return res.status(400).send('Coin parameter is required');
  }

  try {
    const data = await CryptoData.find({ coin }).sort({ timestamp: -1 }).limit(100);

    if (data.length < 2) {
      return res.status(400).send('Not enough data to calculate deviation');
    }

    const prices = data.map(record => record.price);

    const mean = prices.reduce((acc, price) => acc + price, 0) / prices.length;

    const variance = prices.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) / prices.length;

    const deviation = Math.sqrt(variance);

    return res.json({ deviation });
  } catch (error) {
    console.error('Error fetching data from MongoDB for deviation:', error.message);
    return res.status(500).send('Error fetching data from MongoDB');
  }
});

app.use("*", (req, res) => {
  res.status(404).send("Welcome to KoinX Assignment");
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
