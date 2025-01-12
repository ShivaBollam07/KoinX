const cryptoService = require('../services/cryptoService');

const getCryptoStats = async (req, res) => {
  const { coin } = req.query;

  if (!coin) {
    return res.status(400).json({ error: 'Coin parameter is required' });
  }

  try {
    const stats = await cryptoService.getLatestStats(coin);
    res.json(stats);
  } catch (error) {
    res.status(error.message.includes('No data found') ? 404 : 500)
      .json({ error: error.message });
  }
};

const getDeviation = async (req, res) => {
  const { coin } = req.query;

  if (!coin) {
    return res.status(400).json({ error: 'Coin parameter is required' });
  }

  try {
    const result = await cryptoService.calculateDeviation(coin);
    res.json(result);
  } catch (error) {
    res.status(error.message.includes('No records found') ? 404 : 500)
      .json({ error: error.message });
  }
};

module.exports = {
  getCryptoStats,
  getDeviation
};