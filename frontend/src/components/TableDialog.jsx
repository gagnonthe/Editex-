import React, { useState } from 'react';

export default function TableDialog({ onInsert, onClose }) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  const handleInsert = () => {
    onInsert(Number(rows), Number(cols));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Insert Table</h2>

        <div className="flex gap-6 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">Rows</label>
            <input
              type="number"
              min={1}
              max={20}
              value={rows}
              onChange={(e) => setRows(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">Columns</label>
            <input
              type="number"
              min={1}
              max={10}
              value={cols}
              onChange={(e) => setCols(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* Visual preview */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Preview ({rows} × {cols})</p>
          <div
            className="border border-gray-300 rounded overflow-hidden"
            style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 6)}, 1fr)` }}
          >
            {Array.from({ length: Math.min(rows, 4) * Math.min(cols, 6) }).map((_, i) => (
              <div key={i} className="border border-gray-200 h-6 bg-gray-50" />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Insert Table
          </button>
        </div>
      </div>
    </div>
  );
}
