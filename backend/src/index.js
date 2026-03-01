const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { execFile } = require('child_process');
const os = require('os');
const { rateLimit } = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiter for resource-intensive compile endpoint (10 requests per minute per IP)
const compileLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many compilation requests. Please try again in a minute.' },
});

// General API rate limiter (100 requests per minute per IP)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in a minute.' },
});

// Health check endpoint
app.get('/api/health', apiLimiter, (req, res) => {
  res.json({ status: 'ok', message: 'Editex backend is running' });
});

// Check if pdflatex is available
function checkPdflatex() {
  return new Promise((resolve) => {
    execFile('pdflatex', ['--version'], (error) => {
      resolve(!error);
    });
  });
}

// Compile LaTeX to PDF
app.post('/api/compile', compileLimiter, async (req, res) => {
  const { latex } = req.body;

  if (!latex) {
    return res.status(400).json({ error: 'No LaTeX content provided' });
  }

  const hasPdflatex = await checkPdflatex();

  if (!hasPdflatex) {
    // Return the LaTeX source as plain text if pdflatex is not available
    return res.status(503).json({
      error: 'pdflatex not installed on server',
      message: 'Install TeX Live or MiKTeX on the server to enable PDF compilation.',
      latex,
    });
  }

  const tmpDir = path.join(os.tmpdir(), `editex-${uuidv4()}`);
  const texFile = path.join(tmpDir, 'document.tex');
  const pdfFile = path.join(tmpDir, 'document.pdf');

  try {
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(texFile, latex, 'utf8');

    execFile(
      'pdflatex',
      ['-interaction=nonstopmode', `-output-directory=${tmpDir}`, texFile],
      { timeout: 30000 },
      (error, stdout, stderr) => {
        if (error && !fs.existsSync(pdfFile)) {
          // Clean up temp directory
          fs.rmSync(tmpDir, { recursive: true, force: true });
          return res.status(500).json({
            error: 'LaTeX compilation failed',
            details: stderr || stdout,
          });
        }

        if (!fs.existsSync(pdfFile)) {
          fs.rmSync(tmpDir, { recursive: true, force: true });
          return res.status(500).json({ error: 'PDF file was not generated' });
        }

        const pdfBuffer = fs.readFileSync(pdfFile);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
        res.send(pdfBuffer);

        // Clean up temp directory after sending
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    );
  } catch (err) {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Download LaTeX source
app.post('/api/download-latex', apiLimiter, (req, res) => {
  const { latex } = req.body;

  if (!latex) {
    return res.status(400).json({ error: 'No LaTeX content provided' });
  }

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'attachment; filename="document.tex"');
  res.send(latex);
});

app.listen(PORT, () => {
  console.log(`Editex backend running on http://localhost:${PORT}`);
});

module.exports = app;
