const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');


const app = express();
const PORT = process.env.PORT || 5000; // Use PORT from environment or default to 5000

// API Key for Google PageSpeed Insights
const apiKey = process.env.PAGE_SPEED_API_KEY || 'AIzaSyDLCLJNTfjl5aLZuH_zGLnZ7eKyHRGRCE8';
const apiUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

app.use(cors()); // Allow all origins
app.use(express.json());

// Route for PageSpeed Insights
app.get('/pagespeed', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const encodedUrl = encodeURIComponent(url);

    // Fetch mobile data
    const mobileResponse = await axios.get(`${apiUrl}?url=${encodedUrl}&key=${apiKey}&category=performance&category=accessibility&category=best-practices&category=seo&strategy=mobile`);
    const mobileData = mobileResponse.data;

    if (!mobileResponse.status === 200) {
      return res.status(500).json({ error: mobileData.error.message || 'Error fetching mobile data from PageSpeed Insights' });
    }

    // Fetch desktop data
    const desktopResponse = await axios.get(`${apiUrl}?url=${encodedUrl}&key=${apiKey}&category=performance&category=accessibility&category=best-practices&category=seo&strategy=desktop`);
    const desktopData = desktopResponse.data;

    if (!desktopResponse.status === 200) {
      return res.status(500).json({ error: desktopData.error.message || 'Error fetching desktop data from PageSpeed Insights' });
    }

    // Send both mobile and desktop data
    res.json({
      mobile: mobileData,
      desktop: desktopData,
    });

  } catch (error) {
    console.error("Error fetching PageSpeed Insights:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to fetch the source code, robots.txt, sitemap.xml, and a 404 page from a URL
app.get('/proxy-fetch', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const mainResponse = await axios.get(url);

    const parsedUrl = new URL(url);
    const domain = `${parsedUrl.protocol}//${parsedUrl.hostname}`;

    const robotsResponse = await axios.get(`${domain}/robots.txt`).catch(() => ({ data: null }));
    const sitemapResponse = await axios.get(`${domain}/sitemap.xml`).catch(() => ({ data: null }));
    const page404Response = await axios.get(`${domain}/non-existent-page`).catch(err => {
      if (err.response && err.response.status === 404) {
        return { data: err.response.data };
      } else {
        return { data: null };
      }
    });

    // Return all fetched data
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

// Static file serving for public assets
app.use(express.static(path.join(__dirname, "public")));

// Route to generate PDF report
app.get("/generate-pdf", (req, res) => {
  const content = {
    title: "SEO Analysis Report",
    url: req.query.url || "https://example.com",
    content: "<p>This is a sample SEO analysis report content. The report shows various metrics and SEO recommendations.</p>",
    footer: "Contact us: contact@dgtlmart.com | Phone: 9810559439",
    generatedOn: new Date().toLocaleString(),
  };

  // Call generatePDF function to generate and stream the PDF directly to the client
  generatePDF(content, res);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
