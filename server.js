const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;

app.use(cors()); // Allow all origins

// Define the /proxy-fetch route
app.get('/proxy-fetch', async (req, res) => {
    console.log('Request received:', req.query.url); // Log incoming URL
    const { url } = req.query;
  
    if (!url) {
      console.error('No URL provided');
      return res.status(400).json({ error: 'URL is required' });
    }
  
    try {
      const response = await axios.get(url);
      console.log('URL fetched successfully');
      res.send(response.data);
    } catch (error) {
      console.error('Error fetching URL:', error.message);
      res.status(500).json({ error: 'Failed to fetch the source code' });
    }
  });

  app.get('/fetch-file', async (req, res) => {
    const { url, file } = req.query;
  
    // Check if URL and file are provided
    if (!url || !file) {
      return res.status(400).send('URL or file is missing');
    }
  
    try {
      // Construct the proxy URL
      const proxyUrl = `http://localhost:5000/proxy-fetch?url=${encodeURIComponent(url)}/${file}`;
      
      // Fetch data from the proxy URL
      const response = await fetch(proxyUrl);
  
      if (!response.ok) {
        // Handle failure if the file is not found
        return res.status(404).send(`${file} not found at ${url}`);
      }
      
      // Get the response text
      const text = await response.text();
      
      // Send the file contents back to the client
      res.send(text);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching the file');
    }
  });
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
