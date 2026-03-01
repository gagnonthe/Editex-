/**
 * Converts a Slate.js document node tree into a complete LaTeX document string.
 */

export function serializeNodeToLatex(node) {
  if (!node) return '';

  // Text node
  if (typeof node.text === 'string') {
    let text = escapeLatex(node.text);
    if (node.bold) text = `\\textbf{${text}}`;
    if (node.italic) text = `\\textit{${text}}`;
    if (node.underline) text = `\\underline{${text}}`;
    if (node.code) text = `\\texttt{${text}}`;
    if (node.strikethrough) text = `\\sout{${text}}`;
    return text;
  }

  const children = (node.children || []).map(serializeNodeToLatex).join('');

  switch (node.type) {
    case 'heading-one':
      return `\\section{${children}}\n`;
    case 'heading-two':
      return `\\subsection{${children}}\n`;
    case 'heading-three':
      return `\\subsubsection{${children}}\n`;
    case 'block-quote':
      return `\\begin{quote}\n${children}\n\\end{quote}\n`;
    case 'bulleted-list':
      return `\\begin{itemize}\n${children}\\end{itemize}\n`;
    case 'numbered-list':
      return `\\begin{enumerate}\n${children}\\end{enumerate}\n`;
    case 'list-item':
      return `  \\item ${children}\n`;
    case 'code-block':
      return `\\begin{verbatim}\n${children}\n\\end{verbatim}\n`;
    case 'math-block':
      return `\\[\n${node.math || children}\n\\]\n`;
    case 'math-inline':
      return `$${node.math || children}$`;
    case 'table':
      return serializeTable(node);
    case 'table-row':
      return serializeTableRow(node);
    case 'table-cell':
      return children;
    case 'align-center':
      return `\\begin{center}\n${children}\n\\end{center}\n`;
    case 'align-right':
      return `\\begin{flushright}\n${children}\n\\end{flushright}\n`;
    case 'paragraph':
    default:
      return `${children}\n\n`;
  }
}

function serializeTable(node) {
  const rows = node.children || [];
  // Determine number of columns from first row
  const firstRow = rows[0];
  const colCount = firstRow ? (firstRow.children || []).length : 1;
  const colSpec = Array(colCount).fill('|l').join('') + '|';

  const rowsLatex = rows.map(serializeTableRow).join('\\hline\n');
  return `\\begin{tabular}{${colSpec}}\n\\hline\n${rowsLatex}\\hline\n\\end{tabular}\n\n`;
}

function serializeTableRow(node) {
  const cells = (node.children || [])
    .map((cell) => (cell.children || []).map(serializeNodeToLatex).join(''))
    .join(' & ');
  return `${cells} \\\\\n`;
}

/**
 * Escapes special LaTeX characters in plain text.
 * Uses a single-pass replacement to avoid double-escaping.
 */
export function escapeLatex(text) {
  const SPECIAL_CHAR_MAP = {
    '\\': '\\textbackslash{}',
    '&': '\\&',
    '%': '\\%',
    '$': '\\$',
    '#': '\\#',
    '_': '\\_',
    '{': '\\{',
    '}': '\\}',
    '~': '\\textasciitilde{}',
    '^': '\\textasciicircum{}',
  };
  return text.replace(/[\\&%$#_{}~^]/g, (char) => SPECIAL_CHAR_MAP[char] ?? char);
}

/**
 * Wraps serialized body content in a full LaTeX document.
 */
export function buildLatexDocument(bodyContent, options = {}) {
  const {
    title = 'Document',
    author = '',
    date = '\\today',
    fontSize = '12pt',
    paperSize = 'a4paper',
  } = options;

  const hasMath = bodyContent.includes('\\[') || bodyContent.includes('$');
  const hasTables = bodyContent.includes('\\begin{tabular}');
  const hasCode = bodyContent.includes('\\begin{verbatim}');
  const hasStrike = bodyContent.includes('\\sout{');

  const packages = [
    `\\usepackage[${paperSize},margin=2.5cm]{geometry}`,
    '\\usepackage[utf8]{inputenc}',
    '\\usepackage[T1]{fontenc}',
    '\\usepackage{lmodern}',
    '\\usepackage{hyperref}',
    hasMath ? '\\usepackage{amsmath}\n\\usepackage{amssymb}' : null,
    hasTables ? '\\usepackage{booktabs}' : null,
    hasStrike ? '\\usepackage[normalem]{ulem}' : null,
  ]
    .filter(Boolean)
    .join('\n');

  const titleBlock =
    title || author
      ? `\\title{${escapeLatex(title)}}\n\\author{${escapeLatex(author)}}\n\\date{${date}}\n\n\\begin{document}\n\\maketitle\n`
      : '\\begin{document}\n';

  return `\\documentclass[${fontSize}]{article}\n${packages}\n\n${titleBlock}\n${bodyContent}\n\\end{document}\n`;
}

/**
 * Converts the full Slate editor value to a complete LaTeX document string.
 */
export function editorToLatex(nodes, options = {}) {
  const body = nodes.map(serializeNodeToLatex).join('');
  return buildLatexDocument(body, options);
}
