// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

// Get environment variables
const PORT = process.env.PORT || 3000;
const HEALTH_ENDPOINTS = (process.env.TARGET_APP_URLS || 'http://redcomm.co.id/').split(',').map(url => url.trim());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const healthCheckPromises = [];

    // Create health check promises for each target URL
    HEALTH_ENDPOINTS.forEach(endpoint => {
      // Check if the URL already contains a protocol
      const fullUrl = endpoint.startsWith('http') ? endpoint : `http://${endpoint}`;
      console.log(fullUrl);
      healthCheckPromises.push(axios.get(fullUrl, { timeout: 1000 }));
    });
    // Execute all health checks
    const responses = await Promise.all(healthCheckPromises);
    
    // Check if all responses have 200 status code
    const allHealthy = responses.every(response => response.status === 200);

    if (allHealthy) {
      return res.json({ status: "OK" });
    } else {
      return res.status(503).json({ 
        status: "ERROR", 
        message: "One or more health checks failed" 
      });
    }
  } catch (error) {
    console.error('Health check failed:', error.message);
    return res.status(503).json({ 
      status: "ERROR", 
      message: "Health check failed from " + error.config.url + ": " + error.message 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Health check service running on port ${PORT}`);
});