const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000; // Use PORT from environment or default to 5000

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

// Fetch-file route
app.get('/fetch-file', async (req, res) => {
    const { url, file } = req.query;

    if (!url || !file) {
      return res.status(400).send('URL or file is missing');
    }

    try {
      const proxyUrl = `http://localhost:${PORT}/proxy-fetch?url=${encodeURIComponent(url)}/${file}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        return res.status(404).send(`${file} not found at ${url}`);
      }

      const text = await response.text();
      res.send(text);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching the file');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
