import React from 'react';
import { useSlate, ReactEditor } from 'slate-react';
import { Editor, Transforms, Element as SlateElement } from 'slate';

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const ALIGN_TYPES = ['align-center', 'align-right'];

// ── Mark helpers ─────────────────────────────────────────────────────────────

function isMarkActive(editor, format) {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
}

function toggleMark(editor, format) {
  if (isMarkActive(editor, format)) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
}

// ── Block helpers ─────────────────────────────────────────────────────────────

function isBlockActive(editor, format) {
  const { selection } = editor;
  if (!selection) return false;
  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    })
  );
  return !!match;
}

function toggleBlock(editor, format) {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);
  const isAlign = ALIGN_TYPES.includes(format);

  // Unwrap any existing list or align
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      (LIST_TYPES.includes(n.type) || ALIGN_TYPES.includes(n.type)),
    split: true,
  });

  let newType;
  if (isActive) {
    newType = 'paragraph';
  } else if (isList) {
    newType = 'list-item';
  } else {
    newType = format;
  }

  Transforms.setNodes(editor, { type: newType });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }

  if (!isActive && isAlign) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
}

// ── Button components ─────────────────────────────────────────────────────────

function MarkButton({ format, children, title }) {
  const editor = useSlate();
  const active = isMarkActive(editor, format);
  return (
    <button
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        toggleMark(editor, format);
      }}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-indigo-600 text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

function BlockButton({ format, children, title }) {
  const editor = useSlate();
  const active = isBlockActive(editor, format);
  return (
    <button
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        toggleBlock(editor, format);
      }}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-indigo-600 text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px bg-gray-300 mx-1 self-stretch" />;
}

// ── Toolbar ───────────────────────────────────────────────────────────────────

export default function Toolbar({ onInsertMath, onInsertTable }) {
  const editor = useSlate();

  const handleUndo = (e) => {
    e.preventDefault();
    editor.undo();
  };

  const handleRedo = (e) => {
    e.preventDefault();
    editor.redo();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
      {/* Undo / Redo */}
      <button
        title="Undo (Ctrl+Z)"
        onMouseDown={handleUndo}
        className="px-2 py-1 rounded text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        ↩
      </button>
      <button
        title="Redo (Ctrl+Y)"
        onMouseDown={handleRedo}
        className="px-2 py-1 rounded text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        ↪
      </button>

      <Divider />

      {/* Headings */}
      <BlockButton format="heading-one" title="Heading 1">H1</BlockButton>
      <BlockButton format="heading-two" title="Heading 2">H2</BlockButton>
      <BlockButton format="heading-three" title="Heading 3">H3</BlockButton>

      <Divider />

      {/* Inline marks */}
      <MarkButton format="bold" title="Bold (Ctrl+B)">
        <strong>B</strong>
      </MarkButton>
      <MarkButton format="italic" title="Italic (Ctrl+I)">
        <em>I</em>
      </MarkButton>
      <MarkButton format="underline" title="Underline (Ctrl+U)">
        <u>U</u>
      </MarkButton>
      <MarkButton format="strikethrough" title="Strikethrough">
        <s>S</s>
      </MarkButton>
      <MarkButton format="code" title="Inline code">
        {'</>'}
      </MarkButton>

      <Divider />

      {/* Lists */}
      <BlockButton format="bulleted-list" title="Bulleted list">• List</BlockButton>
      <BlockButton format="numbered-list" title="Numbered list">1. List</BlockButton>

      <Divider />

      {/* Alignment */}
      <BlockButton format="align-center" title="Center align">⊝ Center</BlockButton>
      <BlockButton format="align-right" title="Right align">→ Right</BlockButton>

      <Divider />

      {/* Special blocks */}
      <BlockButton format="block-quote" title="Block quote">❝ Quote</BlockButton>
      <BlockButton format="code-block" title="Code block">Code</BlockButton>

      <Divider />

      {/* Math */}
      <button
        title="Insert block equation"
        onMouseDown={(e) => {
          e.preventDefault();
          onInsertMath('block');
        }}
        className="px-2 py-1 rounded text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        ∑ Equation
      </button>
      <button
        title="Insert inline math"
        onMouseDown={(e) => {
          e.preventDefault();
          onInsertMath('inline');
        }}
        className="px-2 py-1 rounded text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        f(x) Inline
      </button>

      <Divider />

      {/* Table */}
      <button
        title="Insert table"
        onMouseDown={(e) => {
          e.preventDefault();
          onInsertTable();
        }}
        className="px-2 py-1 rounded text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        ⊞ Table
      </button>
    </div>
  );
}
