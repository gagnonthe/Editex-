import React, { useCallback, useMemo, useState } from 'react';
import { createEditor, Transforms, Editor, Element as SlateElement, Text } from 'slate';
import { Slate, Editable, withReact, useSlate, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import Toolbar from './Toolbar';
import MathDialog from './MathDialog';
import TableDialog from './TableDialog';

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'Welcome to Editex! Start typing your document here.' }],
  },
];

// Custom element rendering
function renderElement(props) {
  const { attributes, children, element } = props;
  switch (element.type) {
    case 'heading-one':
      return <h1 {...attributes} className="text-3xl font-bold my-3">{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes} className="text-2xl font-bold my-2">{children}</h2>;
    case 'heading-three':
      return <h3 {...attributes} className="text-xl font-bold my-2">{children}</h3>;
    case 'block-quote':
      return (
        <blockquote
          {...attributes}
          className="border-l-4 border-indigo-500 pl-4 italic text-gray-600 my-2"
        >
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return <ul {...attributes} className="list-disc pl-6 my-2">{children}</ul>;
    case 'numbered-list':
      return <ol {...attributes} className="list-decimal pl-6 my-2">{children}</ol>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'code-block':
      return (
        <pre
          {...attributes}
          className="bg-gray-100 rounded p-3 font-mono text-sm my-2 overflow-x-auto"
        >
          <code>{children}</code>
        </pre>
      );
    case 'math-block': {
      const math = element.math || '';
      return (
        <div {...attributes} className="my-3">
          <div contentEditable={false} className="bg-blue-50 border border-blue-200 rounded p-3 text-center font-mono text-sm text-blue-800">
            {'\\[ ' + math + ' \\]'}
          </div>
          <span className="hidden">{children}</span>
        </div>
      );
    }
    case 'math-inline': {
      const math = element.math || '';
      return (
        <span {...attributes}>
          <span contentEditable={false} className="bg-blue-50 border border-blue-100 rounded px-1 font-mono text-sm text-blue-700">
            {'$' + math + '$'}
          </span>
          <span className="hidden">{children}</span>
        </span>
      );
    }
    case 'table':
      return (
        <table {...attributes} className="border-collapse w-full my-3 table-fixed">
          <tbody>{children}</tbody>
        </table>
      );
    case 'table-row':
      return <tr {...attributes}>{children}</tr>;
    case 'table-cell':
      return (
        <td
          {...attributes}
          className="border border-gray-300 px-3 py-2 align-top"
        >
          {children}
        </td>
      );
    case 'align-center':
      return <div {...attributes} className="text-center">{children}</div>;
    case 'align-right':
      return <div {...attributes} className="text-right">{children}</div>;
    default:
      return <p {...attributes} className="my-1 leading-relaxed">{children}</p>;
  }
}

// Custom leaf rendering for inline marks
function renderLeaf({ attributes, children, leaf }) {
  let content = children;
  if (leaf.bold) content = <strong>{content}</strong>;
  if (leaf.italic) content = <em>{content}</em>;
  if (leaf.underline) content = <u>{content}</u>;
  if (leaf.code) content = <code className="bg-gray-100 rounded px-1 font-mono text-sm">{content}</code>;
  if (leaf.strikethrough) content = <s>{content}</s>;
  return <span {...attributes}>{content}</span>;
}

export default function EditorComponent({ onLatexChange }) {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [showMathDialog, setShowMathDialog] = useState(false);
  const [mathMode, setMathMode] = useState('block');
  const [showTableDialog, setShowTableDialog] = useState(false);

  const handleChange = useCallback(
    (value) => {
      onLatexChange(value);
    },
    [onLatexChange]
  );

  const handleOpenMath = (mode) => {
    setMathMode(mode);
    setShowMathDialog(true);
  };

  const handleInsertMath = (mathStr, mode) => {
    setShowMathDialog(false);
    if (mode === 'block') {
      Transforms.insertNodes(editor, {
        type: 'math-block',
        math: mathStr,
        children: [{ text: '' }],
      });
      Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] });
    } else {
      Transforms.insertNodes(editor, {
        type: 'math-inline',
        math: mathStr,
        children: [{ text: '' }],
      });
    }
  };

  const handleInsertTable = (rows, cols) => {
    setShowTableDialog(false);
    const tableNode = {
      type: 'table',
      children: Array.from({ length: rows }, () => ({
        type: 'table-row',
        children: Array.from({ length: cols }, () => ({
          type: 'table-cell',
          children: [{ type: 'paragraph', children: [{ text: '' }] }],
        })),
      })),
    };
    Transforms.insertNodes(editor, tableNode);
    Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] });
  };

  return (
    <div className="flex flex-col h-full">
      <Slate editor={editor} initialValue={initialValue} onChange={handleChange}>
        <Toolbar
          onInsertMath={handleOpenMath}
          onInsertTable={() => setShowTableDialog(true)}
        />
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <Editable
            className="editor-content min-h-96 focus:outline-none"
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Start typing your document here…"
            spellCheck
            autoFocus
          />
        </div>
      </Slate>

      {showMathDialog && (
        <MathDialog
          mode={mathMode}
          onInsert={handleInsertMath}
          onClose={() => setShowMathDialog(false)}
        />
      )}
      {showTableDialog && (
        <TableDialog
          onInsert={handleInsertTable}
          onClose={() => setShowTableDialog(false)}
        />
      )}
    </div>
  );
}
