import { editorToLatex, escapeLatex, serializeLeaf, serializeNode } from '../utils/latexConverter';

describe('escapeLatex', () => {
  it('escapes special LaTeX characters', () => {
    expect(escapeLatex('hello & world')).toContain('\\&');
    expect(escapeLatex('100%')).toContain('\\%');
    expect(escapeLatex('$10')).toContain('\\$');
    expect(escapeLatex('#1')).toContain('\\#');
    expect(escapeLatex('a_b')).toContain('\\_');
  });

  it('returns empty string for falsy input', () => {
    expect(escapeLatex('')).toBe('');
    expect(escapeLatex(null)).toBe('');
    expect(escapeLatex(undefined)).toBe('');
  });
});

describe('serializeLeaf', () => {
  it('handles plain text', () => {
    expect(serializeLeaf({ text: 'hello' })).toBe('hello');
  });

  it('wraps bold text', () => {
    expect(serializeLeaf({ text: 'bold', bold: true })).toBe('\\textbf{bold}');
  });

  it('wraps italic text', () => {
    expect(serializeLeaf({ text: 'italic', italic: true })).toBe('\\textit{italic}');
  });

  it('wraps underline text', () => {
    expect(serializeLeaf({ text: 'under', underline: true })).toBe('\\underline{under}');
  });

  it('handles combined formatting', () => {
    const result = serializeLeaf({ text: 'combo', bold: true, italic: true });
    expect(result).toContain('\\textbf');
    expect(result).toContain('\\textit');
    expect(result).toContain('combo');
  });
});

describe('serializeNode', () => {
  it('serializes a paragraph', () => {
    const node = { type: 'paragraph', children: [{ text: 'Hello world' }] };
    expect(serializeNode(node)).toContain('Hello world');
  });

  it('serializes heading-one as section', () => {
    const node = { type: 'heading-one', children: [{ text: 'Title' }] };
    expect(serializeNode(node)).toContain('\\section{Title}');
  });

  it('serializes heading-two as subsection', () => {
    const node = { type: 'heading-two', children: [{ text: 'Sub' }] };
    expect(serializeNode(node)).toContain('\\subsection{Sub}');
  });

  it('serializes bulleted list', () => {
    const node = {
      type: 'bulleted-list',
      children: [
        { type: 'list-item', children: [{ text: 'item 1' }] },
      ],
    };
    const result = serializeNode(node);
    expect(result).toContain('\\begin{itemize}');
    expect(result).toContain('\\item item 1');
    expect(result).toContain('\\end{itemize}');
  });

  it('serializes numbered list', () => {
    const node = {
      type: 'numbered-list',
      children: [
        { type: 'list-item', children: [{ text: 'first' }] },
      ],
    };
    const result = serializeNode(node);
    expect(result).toContain('\\begin{enumerate}');
    expect(result).toContain('\\item first');
    expect(result).toContain('\\end{enumerate}');
  });

  it('serializes math block', () => {
    const node = { type: 'math-block', math: 'E = mc^2', children: [{ text: '' }] };
    const result = serializeNode(node);
    expect(result).toContain('E = mc^2');
    expect(result).toContain('\\[');
    expect(result).toContain('\\]');
  });
});

describe('editorToLatex', () => {
  it('produces a full LaTeX document', () => {
    const nodes = [
      { type: 'paragraph', children: [{ text: 'Hello' }] },
    ];
    const result = editorToLatex(nodes);
    expect(result).toContain('\\documentclass{article}');
    expect(result).toContain('\\begin{document}');
    expect(result).toContain('Hello');
    expect(result).toContain('\\end{document}');
  });

  it('includes necessary packages', () => {
    const result = editorToLatex([{ type: 'paragraph', children: [{ text: '' }] }]);
    expect(result).toContain('\\usepackage{amsmath}');
    expect(result).toContain('\\usepackage[utf8]{inputenc}');
  });
});
