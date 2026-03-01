const express = require('express');
const cors = require('cors');
const path = require('path');
const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Compile LaTeX to PDF
app.post('/api/compile', (req, res) => {
  const { latex } = req.body;
  if (!latex) {
    return res.status(400).json({ error: 'No LaTeX content provided' });
  }

  // Create a temporary directory for compilation
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'editex-'));
  const texFile = path.join(tmpDir, 'document.tex');
  const pdfFile = path.join(tmpDir, 'document.pdf');

  fs.writeFileSync(texFile, latex);

  // Use pdflatex for compilation (execFile avoids shell injection)
  execFile(
    'pdflatex',
    ['-interaction=nonstopmode', '-output-directory', tmpDir, texFile],
    { timeout: 30000 },
    (error, stdout, stderr) => {
    if (fs.existsSync(pdfFile)) {
      const pdfBuffer = fs.readFileSync(pdfFile);
      // Clean up
      fs.rmSync(tmpDir, { recursive: true, force: true });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
      res.send(pdfBuffer);
    } else {
      // Clean up
      fs.rmSync(tmpDir, { recursive: true, force: true });
      res.status(500).json({
        error: 'LaTeX compilation failed',
        details: stdout || stderr || (error ? error.message : 'Unknown error')
      });
    }
  });
});

// Download raw LaTeX file
app.post('/api/download-latex', (req, res) => {
  const { latex } = req.body;
  if (!latex) {
    return res.status(400).json({ error: 'No LaTeX content provided' });
  }
  res.setHeader('Content-Type', 'application/x-tex');
  res.setHeader('Content-Disposition', 'attachment; filename="document.tex"');
  res.send(latex);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Editex backend running on port ${PORT}`);
  });
}

module.exports = app;
