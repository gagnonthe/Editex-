import React, { useState } from 'react';

export default function MathDialog({ mode, onInsert, onClose }) {
  const [math, setMath] = useState('');

  const examples = [
    { label: 'Fraction', value: '\\frac{a}{b}' },
    { label: 'Sum', value: '\\sum_{i=1}^{n} x_i' },
    { label: 'Integral', value: '\\int_{0}^{\\infty} f(x)\\,dx' },
    { label: 'Matrix', value: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
    { label: 'Greek', value: '\\alpha + \\beta = \\gamma' },
  ];

  const handleInsert = () => {
    if (math.trim()) {
      onInsert(math.trim(), mode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Insert {mode === 'block' ? 'Block' : 'Inline'} Math
        </h2>

        <label className="block text-sm font-medium text-gray-600 mb-1">
          LaTeX math expression
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y"
          rows={4}
          placeholder={mode === 'block' ? 'e.g. \\frac{a}{b}' : 'e.g. x^2 + y^2'}
          value={math}
          onChange={(e) => setMath(e.target.value)}
          autoFocus
        />

        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-2">Quick insert:</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex.label}
                onClick={() => setMath(ex.value)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-indigo-100 rounded border border-gray-200 font-mono"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={!math.trim()}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}
