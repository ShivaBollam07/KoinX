const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cronJobs = require('./utils/cronJobs');
const cryptoRoutes = require('./routes/cryptoRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { connectTimeoutMS: 30000 })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(express.json());
app.use('/', cryptoRoutes);

app.use("*", (req, res) => {
  const apiDocs = `
    <h1>Welcome to KoinX Assignment API Documentation</h1>
    <p>Here are the available APIs:</p>
    
    <h3>1. Fetch Latest Cryptocurrency Stats</h3>
    <p><strong>Endpoint:</strong> GET /stats</p>
    <p><strong>Query Params:</strong></p>
    <ul>
      <li><strong>coin</strong> (required) - The cryptocurrency ID (e.g., bitcoin, matic-network, ethereum).</li>
    </ul>
    <p><strong>Sample Request:</strong></p>
    <pre>GET /stats?coin=bitcoin</pre>
    <p><strong>Sample Response:</strong></p>
    <pre>
    {
      "price": 40000,
      "marketCap": 800000000,
      "24hChange": 3.4
    }
    </pre>

    <h3>2. Fetch Standard Deviation of Cryptocurrency Prices</h3>
    <p><strong>Endpoint:</strong> GET /deviation</p>
    <p><strong>Query Params:</strong></p>
    <ul>
      <li><strong>coin</strong> (required) - The cryptocurrency ID (e.g., bitcoin, matic-network, ethereum).</li>
    </ul>
    <p><strong>Sample Request:</strong></p>
    <pre>GET /deviation?coin=bitcoin</pre>
    <p><strong>Sample Response:</strong></p>
    <pre>
    {
      "deviation": 4082.48
    }
    </pre>
    
  `;
  
  res.status(404).send(apiDocs);
});


cronJobs.startJobs();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
