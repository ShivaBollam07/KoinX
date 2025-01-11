const CryptoData = require('../models/CryptoData');

exports.getStats = async (req, res) => {
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
    res.json({
      price: latestData.price,
      marketCap: latestData.marketCap,
      "24hChange": latestData.change24h,
    });
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error.message);
    res.status(500).send('Error fetching data from MongoDB');
  }
};

exports.getDeviation = async (req, res) => {
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

    res.json({ deviation });
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error.message);
    res.status(500).send('Error fetching data from MongoDB');
  }
};
