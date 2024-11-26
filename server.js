const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000; // Use PORT from environment or default to 5000

app.use(cors()); // Allow all origins


app.get('/proxy-fetch', async (req, res) => {
  console.log('Request received:', req.query.url); // Log incoming URL
  const { url } = req.query;

  if (!url) {
    console.error('No URL provided');
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Fetch the main source code
    const mainResponse = await axios.get(url);
    console.log('URL fetched successfully');

    // Extract the domain
    const parsedUrl = new URL(url);
    const domain = `${parsedUrl.protocol}//${parsedUrl.hostname}`;

    // Fetch /robots.txt
    const robotsResponse = await axios.get(`${domain}/robots.txt`).catch(err => {
      console.warn('/robots.txt not found');
      return { data: null }; // Return null if not found
    });

    // Fetch /sitemap.xml
    const sitemapResponse = await axios.get(`${domain}/sitemap.xml`).catch(err => {
      console.warn('/sitemap.xml not found');
      return { data: null }; // Return null if not found
    });

    // Fetch a non-existent URL to trigger the 404 page
    const page404Response = await axios.get(`${domain}/non-existent-page`).catch(err => {
      // If it's a 404 error, capture the HTML content
      if (err.response && err.response.status === 404) {
        console.log('404 page content fetched');
        return { data: err.response.data }; // Return the 404 page HTML content
      } else {
        console.warn('Error fetching 404 page:', err.message);
        return { data: null };
      }
    });

    // Return all data
    res.json({
      sourceCode: mainResponse.data,
      robots: robotsResponse.data || 'No /robots.txt found',
      sitemap: sitemapResponse.data || 'No /sitemap.xml found',
      page404: page404Response.data || 'No 404 page found',
    });
  } catch (error) {
    console.error('Error fetching URL:', error.message);
    res.status(500).json({ error: 'Failed to fetch the source code' });
  }
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
