import React, { useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export default function ExportPanel({ latex, docOptions, onDocOptionsChange }) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleExportPDF = async () => {
    setExporting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latex }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.pdf';
        a.click();
        URL.revokeObjectURL(url);
        setSuccessMsg('PDF exported successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const data = await res.json();
        if (res.status === 503) {
          setError(`PDF compilation unavailable: ${data.message || 'pdflatex not installed on server.'}`);
        } else {
          setError(`Error: ${data.error || 'Compilation failed'}`);
        }
      }
    } catch (err) {
      setError('Cannot connect to the backend. Make sure the server is running on port 5000.');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadTex = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/download-latex`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latex }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.tex';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // Fallback: download directly from browser
      const blob = new Blob([latex], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.tex';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span>📄</span> Document Settings & Export
      </h2>

      {/* Document options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Title</label>
          <input
            type="text"
            value={docOptions.title}
            onChange={(e) => onDocOptionsChange({ ...docOptions, title: e.target.value })}
            placeholder="Document title"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Author</label>
          <input
            type="text"
            value={docOptions.author}
            onChange={(e) => onDocOptionsChange({ ...docOptions, author: e.target.value })}
            placeholder="Author name"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Font Size</label>
          <select
            value={docOptions.fontSize}
            onChange={(e) => onDocOptionsChange({ ...docOptions, fontSize: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="10pt">10pt</option>
            <option value="11pt">11pt</option>
            <option value="12pt">12pt</option>
            <option value="14pt">14pt</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Paper Size</label>
          <select
            value={docOptions.paperSize}
            onChange={(e) => onDocOptionsChange({ ...docOptions, paperSize: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="a4paper">A4</option>
            <option value="letterpaper">Letter</option>
            <option value="a5paper">A5</option>
          </select>
        </div>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
          {successMsg}
        </div>
      )}

      {/* Export buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Compiling…
            </>
          ) : (
            <>📥 Export PDF</>
          )}
        </button>

        <button
          onClick={handleDownloadTex}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
        >
          📄 Download .tex
        </button>
      </div>
    </div>
  );
}
