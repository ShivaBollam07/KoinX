const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cryptoRoutes = require('./routes/cryptoRoutes');
const { startCronJobs } = require('./utils/cronJobs');
const cryptoService = require('./services/cryptoService');

const app = express();
const port = 3000;

mongoose.connect(process.env.MONGO_URI, {
  connectTimeoutMS: 30000,
})
  .then(() => console.log('[MongoDB] Connected successfully'))
  .catch((err) => console.error('[MongoDB] Connection error:', err));

startCronJobs();

console.log('[Server] Starting immediate data fetch for initial testing');
cryptoService.fetchAndStoreCryptoData().then(() => {
  console.log('[Server] Initial data fetch completed');
}).catch(err => {
  console.error('[Server] Error during initial data fetch:', err.message);
});

app.use(express.json());

app.use('/', cryptoRoutes);

app.use("*", (req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>KoinX Assignment API Documentation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
        h1 { color: #333; }
        pre { background: #f4f4f4; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        code { color: #c7254e; background-color: #f9f2f4; padding: 2px 4px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <h1>KoinX Assignment API Documentation</h1>
      <p>Here are the available APIs:</p>

      <h2>1. Fetch Latest Cryptocurrency Stats</h2>
      <p><strong>Endpoint:</strong> <code>GET /stats</code></p>
      <p><strong>Query Params:</strong></p>
      <ul>
        <li><code>coin</code> (required) - The cryptocurrency ID (e.g., <code>bitcoin</code>, <code>matic-network</code>, <code>ethereum</code>).</li>
      </ul>
      <p><strong>Sample Request:</strong></p>
      <pre><code>GET /stats?coin=bitcoin</code></pre>
      <p><strong>Sample Response:</strong></p>
      <pre><code>{
  "price": 40000,
  "marketCap": 800000000,
  "change24h": 3.4
}</code></pre>

      <h2>2. Fetch Standard Deviation of Cryptocurrency Prices</h2>
      <p><strong>Endpoint:</strong> <code>GET /deviation</code></p>
      <p><strong>Query Params:</strong></p>
      <ul>
        <li><code>coin</code> (required) - The cryptocurrency ID (e.g., <code>bitcoin</code>, <code>matic-network</code>, <code>ethereum</code>).</li>
      </ul>
      <p><strong>Sample Request:</strong></p>
      <pre><code>GET /deviation?coin=bitcoin</code></pre>
      <p><strong>Sample Response:</strong></p>
      <pre><code>{
  "coinId": "bitcoin",
  "standardDeviation": 4082.48,
  "recordsCount": 100
}</code></pre>

    </body>
    </html>
  `);
});


app.listen(port, () => {
  console.log(`[Server] Running on http://localhost:${port}`);
});
