import React from 'react';

function LatexPanel({ latexCode }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(latexCode).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = latexCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    });
  };

  return (
    <div className="md:w-1/2 border-t md:border-t-0 md:border-l border-gray-200 bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-200 border-b border-gray-300">
        <span className="font-semibold text-sm text-gray-700">LaTeX Code</span>
        <button
          onClick={handleCopy}
          className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
        >
          📋 Copy
        </button>
      </div>
      <pre className="flex-1 overflow-auto p-4 text-sm font-mono text-gray-800 whitespace-pre-wrap">
        {latexCode}
      </pre>
    </div>
  );
}

export default LatexPanel;
