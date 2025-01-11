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
app.use('/api/crypto', cryptoRoutes);

cronJobs.startJobs();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
