require('dotenv').config();
require('dns').setServers(['8.8.8.8', '8.8.4.4']); // Fix for ECONNREFUSED on SRV queries
const connectDB = require('../config/db');
const app = require('../app');

let isDbConnected = false;

// Connect to MongoDB on cold starts
if (!isDbConnected) {
  connectDB()
    .then(() => {
      isDbConnected = true;
    })
    .catch((err) => {
      console.error('Failed to connect to DB in Serverless function:', err);
    });
}

// Export the Express app for Vercel Serverless
module.exports = app;
