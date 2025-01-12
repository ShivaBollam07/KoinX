const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cryptoRoutes = require('./routes/cryptoRoutes');
const { startCronJobs } = require('./utils/cronJobs');
const cryptoService = require('./services/cryptoService');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/', cryptoRoutes);

async function initializeServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      connectTimeoutMS: 30000,
    });
    console.log('[MongoDB] Connected successfully');

    try {
      await mongoose.connection.db.collection('cryptodatas').drop();
      console.log('[MongoDB] Successfully dropped existing collection');
    } catch (error) {
      console.log('[MongoDB] No existing collection to drop');
    }

    console.log('[Server] Starting initial data fetch...');
    try {
      await cryptoService.fetchAndStoreCryptoData();
      console.log('[Server] Initial data fetch completed successfully');
    } catch (error) {
      console.error('[Server] Initial data fetch failed:', error.message);
      console.log('[Server] Will continue with server startup despite fetch failure');
    }

    startCronJobs();
    console.log('[Server] Cron jobs scheduled');

    app.get("*", (req, res) => {
      res.send(`
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
          
          <h2>Available Endpoints:</h2>
          
          <h3>1. Get Cryptocurrency Stats</h3>
          <p><strong>Endpoint:</strong> <code>GET /stats?coin=bitcoin</code></p>
          <p>Supported coins: bitcoin, matic-network, ethereum</p>
          <p><strong>Sample Response:</strong></p>
          <pre><code>{
  "price": 40000,
  "marketCap": 800000000,
  "24hChange": 3.4
}</code></pre>

          <h3>2. Get Price Standard Deviation</h3>
          <p><strong>Endpoint:</strong> <code>GET /deviation?coin=bitcoin</code></p>
          <p>Supported coins: bitcoin, matic-network, ethereum</p>
          <p><strong>Sample Response:</strong></p>
          <pre><code>{
  "deviation": 4082.48
}</code></pre>
        </body>
        </html>
      `);
    });

  

    app.listen(port, () => {
      console.log(`[Server] Running on port ${port}`);
      console.log('[Server] Initialization completed successfully');
    });

  } catch (error) {
    console.error('[Server] Fatal error during initialization:', error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('[Server] Unhandled Rejection:', error);
  process.exit(1);
});

// Start the server
initializeServer();