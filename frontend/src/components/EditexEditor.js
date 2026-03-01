import React, { useCallback, useMemo, useState } from 'react';
import { createEditor, Transforms, Editor, Element as SlateElement } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import Toolbar from './Toolbar';
import LatexPanel from './LatexPanel';
import MathModal from './MathModal';
import { editorToLatex } from '../utils/latexConverter';
import { compilePdf, downloadLatex, downloadBlob } from '../utils/api';

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

const initialValue = [
  {
    type: 'heading-one',
    children: [{ text: 'Welcome to Editex' }],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'This is a ' },
      { text: 'WYSIWYG', bold: true },
      { text: ' editor that generates ' },
      { text: 'LaTeX', italic: true },
      { text: ' code in real time.' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'Use the toolbar above to format your text, add headings, lists, and math equations.' },
    ],
  },
];

function EditexEditor() {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [value, setValue] = useState(initialValue);
  const [showLatex, setShowLatex] = useState(false);
  const [showMathModal, setShowMathModal] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [error, setError] = useState(null);

  const latexCode = useMemo(() => editorToLatex(value), [value]);

  const renderElement = useCallback((props) => <ElementRenderer {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  const handleExportPdf = async () => {
    setCompiling(true);
    setError(null);
    try {
      const blob = await compilePdf(latexCode);
      downloadBlob(blob, 'document.pdf');
    } catch (err) {
      setError(err.message);
    } finally {
      setCompiling(false);
    }
  };

  const handleDownloadLatex = async () => {
    try {
      const blob = await downloadLatex(latexCode);
      downloadBlob(blob, 'document.tex');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInsertMath = (mathExpr) => {
    const mathNode = {
      type: 'math-block',
      math: mathExpr,
      children: [{ text: '' }],
    };
    Transforms.insertNodes(editor, mathNode);
    setShowMathModal(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <Slate editor={editor} initialValue={initialValue} onChange={setValue}>
        {/* Header */}
        <header className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-xl font-bold tracking-wide">
            📝 Editex
          </h1>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowLatex(!showLatex)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded text-sm font-medium transition"
            >
              {showLatex ? 'Hide LaTeX' : 'Show LaTeX'}
            </button>
            <button
              onClick={() => setShowMathModal(true)}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition"
            >
              ∑ Math
            </button>
            <button
              onClick={handleDownloadLatex}
              className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded text-sm font-medium transition"
            >
              ⬇ .tex
            </button>
            <button
              onClick={handleExportPdf}
              disabled={compiling}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition disabled:opacity-50"
            >
              {compiling ? 'Compiling...' : '📄 Export PDF'}
            </button>
          </div>
        </header>

        {/* Toolbar */}
        <Toolbar editor={editor} />

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 font-bold">&times;</button>
          </div>
        )}

        {/* Main content area */}
        <div className={`flex flex-1 overflow-hidden ${showLatex ? 'flex-col md:flex-row' : ''}`}>
          {/* Editor */}
          <div className={`flex-1 overflow-y-auto p-4 md:p-8 bg-white ${showLatex ? 'md:w-1/2' : ''}`}>
            <div className="max-w-3xl mx-auto min-h-full prose prose-slate">
              <Editable
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                placeholder="Start typing your document..."
                spellCheck
                autoFocus
                className="outline-none min-h-[500px]"
                onKeyDown={(event) => {
                  if (event.ctrlKey || event.metaKey) {
                    switch (event.key) {
                      case 'b':
                        event.preventDefault();
                        toggleMark(editor, 'bold');
                        break;
                      case 'i':
                        event.preventDefault();
                        toggleMark(editor, 'italic');
                        break;
                      case 'u':
                        event.preventDefault();
                        toggleMark(editor, 'underline');
                        break;
                      default:
                        break;
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* LaTeX Panel */}
          {showLatex && (
            <LatexPanel latexCode={latexCode} />
          )}
        </div>
      </Slate>

      {/* Math Modal */}
      {showMathModal && (
        <MathModal
          onInsert={handleInsertMath}
          onClose={() => setShowMathModal(false)}
        />
      )}
    </div>
  );
}

// Toggle mark (bold/italic/underline/code)
export function toggleMark(editor, format) {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
}

export function isMarkActive(editor, format) {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
}

// Toggle block type
export function toggleBlock(editor, format) {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type),
    split: true,
  });

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
}

export function isBlockActive(editor, format) {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n.type === format,
    })
  );

  return !!match;
}

// Render elements
function ElementRenderer({ attributes, children, element }) {
  switch (element.type) {
    case 'heading-one':
      return <h1 {...attributes} className="text-3xl font-bold mt-4 mb-2">{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes} className="text-2xl font-bold mt-3 mb-2">{children}</h2>;
    case 'heading-three':
      return <h3 {...attributes} className="text-xl font-semibold mt-2 mb-1">{children}</h3>;
    case 'bulleted-list':
      return <ul {...attributes} className="list-disc ml-6 my-2">{children}</ul>;
    case 'numbered-list':
      return <ol {...attributes} className="list-decimal ml-6 my-2">{children}</ol>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'block-quote':
      return (
        <blockquote {...attributes} className="border-l-4 border-gray-300 pl-4 italic my-2 text-gray-600">
          {children}
        </blockquote>
      );
    case 'math-block':
      return (
        <div {...attributes} contentEditable={false} className="bg-gray-50 border rounded p-3 my-2 text-center font-mono">
          <span className="text-blue-700">{element.math || '...'}</span>
          {children}
        </div>
      );
    default:
      return <p {...attributes} className="my-1">{children}</p>;
  }
}

// Render leaves (inline formatting)
function Leaf({ attributes, children, leaf }) {
  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.italic) children = <em>{children}</em>;
  if (leaf.underline) children = <u>{children}</u>;
  if (leaf.code) children = <code className="bg-gray-100 px-1 rounded text-sm">{children}</code>;
  return <span {...attributes}>{children}</span>;
}

export default EditexEditor;
