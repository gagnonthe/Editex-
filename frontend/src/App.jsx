import React, { useState, useCallback, useMemo } from 'react';
import EditorComponent from './components/EditorComponent';
import LatexPanel from './components/LatexPanel';
import ExportPanel from './components/ExportPanel';
import { editorToLatex } from './utils/latexSerializer';

const DEFAULT_DOC_OPTIONS = {
  title: 'My Document',
  author: '',
  fontSize: '12pt',
  paperSize: 'a4paper',
};

export default function App() {
  const [editorNodes, setEditorNodes] = useState(null);
  const [docOptions, setDocOptions] = useState(DEFAULT_DOC_OPTIONS);
  const [showLatex, setShowLatex] = useState(true);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'latex' (mobile)

  const latex = useMemo(() => {
    if (!editorNodes) return '';
    return editorToLatex(editorNodes, docOptions);
  }, [editorNodes, docOptions]);

  const handleEditorChange = useCallback((nodes) => {
    setEditorNodes(nodes);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <h1 className="text-xl font-bold leading-tight">Editex</h1>
              <p className="text-xs text-indigo-200">LaTeX-powered document editor</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setShowLatex((v) => !v)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showLatex
                  ? 'bg-indigo-500 text-white'
                  : 'bg-indigo-800 text-indigo-200 hover:bg-indigo-600'
              }`}
            >
              {showLatex ? '◀ Hide LaTeX' : '▶ Show LaTeX'}
            </button>
          </div>
          {/* Mobile tab switcher */}
          <div className="flex md:hidden gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 text-sm rounded ${activeTab === 'editor' ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white'}`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab('latex')}
              className={`px-3 py-1 text-sm rounded ${activeTab === 'latex' ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white'}`}
            >
              LaTeX
            </button>
          </div>
        </div>
      </header>

      {/* Export/Settings bar */}
      <div className="max-w-screen-2xl mx-auto w-full px-4 pt-4">
        <ExportPanel
          latex={latex}
          docOptions={docOptions}
          onDocOptionsChange={setDocOptions}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 py-4 flex gap-4 overflow-hidden">
        {/* Editor panel */}
        <div
          className={`flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col ${
            activeTab === 'latex' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Paper header */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span className="text-sm text-gray-500 font-medium">Document Editor</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <EditorComponent onLatexChange={handleEditorChange} />
          </div>
        </div>

        {/* LaTeX panel - hidden on mobile when editor tab is active, togglable on desktop */}
        {(showLatex || activeTab === 'latex') && (
          <div
            className={`w-full md:w-96 lg:w-[480px] flex-shrink-0 flex flex-col gap-0 ${
              activeTab === 'editor' ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="flex-1 overflow-hidden rounded-xl">
              <LatexPanel latex={latex} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-3">
        Editex — WYSIWYG LaTeX editor • Built with React + Slate.js
      </footer>
    </div>
  );
}
