import React, { useState } from 'react';

const MATH_PRESETS = [
  { label: 'Fraction', value: '\\frac{a}{b}' },
  { label: 'Square Root', value: '\\sqrt{x}' },
  { label: 'Sum', value: '\\sum_{i=1}^{n} x_i' },
  { label: 'Integral', value: '\\int_{a}^{b} f(x) \\, dx' },
  { label: 'Matrix', value: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  { label: 'Limit', value: '\\lim_{x \\to \\infty} f(x)' },
];

function MathModal({ onInsert, onClose }) {
  const [mathExpr, setMathExpr] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mathExpr.trim()) {
      onInsert(mathExpr.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Insert Math Equation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LaTeX Math Expression
          </label>
          <textarea
            value={mathExpr}
            onChange={(e) => setMathExpr(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 font-mono text-sm h-24 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., \frac{a}{b} or \sum_{i=1}^{n} x_i"
            autoFocus
          />

          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Quick insert:</p>
            <div className="flex flex-wrap gap-1">
              {MATH_PRESETS.map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setMathExpr(value)}
                  className="text-xs px-2 py-1 bg-gray-100 border border-gray-200 rounded hover:bg-gray-200 transition"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!mathExpr.trim()}
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 transition disabled:opacity-50"
            >
              Insert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MathModal;
