import React from 'react';
import { useSlate } from 'slate-react';
import { toggleMark, toggleBlock, isMarkActive, isBlockActive } from './EditexEditor';

const MARK_BUTTONS = [
  { format: 'bold', icon: 'B', title: 'Bold (Ctrl+B)', className: 'font-bold' },
  { format: 'italic', icon: 'I', title: 'Italic (Ctrl+I)', className: 'italic' },
  { format: 'underline', icon: 'U', title: 'Underline (Ctrl+U)', className: 'underline' },
  { format: 'code', icon: '<>', title: 'Code', className: 'font-mono text-sm' },
];

const BLOCK_BUTTONS = [
  { format: 'heading-one', icon: 'H1', title: 'Heading 1' },
  { format: 'heading-two', icon: 'H2', title: 'Heading 2' },
  { format: 'heading-three', icon: 'H3', title: 'Heading 3' },
  { format: 'block-quote', icon: '❝', title: 'Block Quote' },
  { format: 'numbered-list', icon: '1.', title: 'Numbered List' },
  { format: 'bulleted-list', icon: '•', title: 'Bulleted List' },
];

function ToolbarButton({ active, onMouseDown, icon, title, className }) {
  return (
    <button
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown();
      }}
      className={`px-2 py-1 rounded text-sm transition ${className || ''} ${
        active
          ? 'bg-gray-300 text-gray-900'
          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
      }`}
    >
      {icon}
    </button>
  );
}

function Toolbar() {
  const editor = useSlate();

  return (
    <div className="flex flex-wrap items-center gap-1 px-4 py-2 bg-gray-100 border-b border-gray-200" role="toolbar" aria-label="Formatting toolbar">
      {MARK_BUTTONS.map(({ format, icon, title, className }) => (
        <ToolbarButton
          key={format}
          active={isMarkActive(editor, format)}
          onMouseDown={() => toggleMark(editor, format)}
          icon={icon}
          title={title}
          className={className}
        />
      ))}
      <span className="w-px h-6 bg-gray-300 mx-1" />
      {BLOCK_BUTTONS.map(({ format, icon, title }) => (
        <ToolbarButton
          key={format}
          active={isBlockActive(editor, format)}
          onMouseDown={() => toggleBlock(editor, format)}
          icon={icon}
          title={title}
        />
      ))}
    </div>
  );
}

export default Toolbar;
