const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function compilePdf(latex) {
  const response = await fetch(`${API_URL}/api/compile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latex }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Compilation failed' }));
    throw new Error(error.details || error.error || 'PDF compilation failed');
  }

  return response.blob();
}

export async function downloadLatex(latex) {
  const response = await fetch(`${API_URL}/api/download-latex`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latex }),
  });

  if (!response.ok) {
    throw new Error('Failed to download LaTeX file');
  }

  return response.blob();
}

export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
