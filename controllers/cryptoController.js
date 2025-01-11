const CryptoData = require('../models/CryptoData');
const cryptoService = require('../services/cryptoService');

const getCryptoStats = async (req, res) => {
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
};

const getStandardDeviation = async (req, res) => {
  const coinId = req.query.coin;

  try {
    const records = await CryptoData.find({ coinId })
      .sort({ timestamp: -1 })
      .limit(100);

    if (records.length === 0) {
      return res.status(404).json({ error: `No records found for cryptocurrency: ${coinId}` });
    }

    const prices = records.map(record => record.price);

    const mean = prices.reduce((acc, price) => acc + price, 0) / prices.length;

    const variance = prices.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) / prices.length;

    const standardDeviation = Math.sqrt(variance);

    res.json({
      coinId,
      standardDeviation: standardDeviation.toFixed(2),
      recordsCount: prices.length,
    });
  } catch (error) {
    console.error('[API] Error calculating standard deviation:', error.message);
    res.status(500).json({ error: 'Failed to calculate standard deviation' });
  }
};

module.exports = {
  getCryptoStats,
  getStandardDeviation,
};
