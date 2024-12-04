const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

/**
 * Generates a PDF and sends it to the client.
 * @param {Object} content - The content to be included in the PDF (e.g., title, url, content, etc.)
 * @param {Object} res - The response object to send the PDF file to the client.
 */
const generatePDF = (content, res) => {
  // Create PDF document
  const doc = new PDFDocument();

  // Set response header to indicate that this is a PDF file
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=SEO_Report.pdf");

  // Pipe the document to the response
  doc.pipe(res);

  // Header section
  doc.fontSize(18).text(content.title, 100, 100);
  doc.fontSize(12).text(`Generated on: ${content.generatedOn}`, 100, 130);
  doc.fontSize(14).text(`Report on: ${content.url}`, 100, 160);

  // Add logo image (ensure it's located in the public directory)
  const logoPath = path.join(__dirname, "public", "logo.jpg"); // Your logo path
  doc.image(logoPath, 100, 50, { width: 100 });

  // Content section
  doc.fontSize(12).text(content.content, 100, 200, { width: 500, align: "justify" });

  // Footer section
  doc.fontSize(10).text(content.footer, 100, 750);

  // Finalize the PDF and end the document
  doc.end();
};

module.exports = generatePDF;
