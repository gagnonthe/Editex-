/**
 * Converts Slate.js editor content to LaTeX code.
 */

function escapeLatex(text) {
  if (!text) return '';
  // Single-pass replacement to avoid corrupting earlier substitutions
  const specialChars = {
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
  return text.replace(/[\\&%$#_{}~^]/g, (match) => specialChars[match]);
}

function serializeLeaf(leaf) {
  let text = escapeLatex(leaf.text);
  if (!text) return '';
  if (leaf.bold) text = `\\textbf{${text}}`;
  if (leaf.italic) text = `\\textit{${text}}`;
  if (leaf.underline) text = `\\underline{${text}}`;
  if (leaf.code) text = `\\texttt{${text}}`;
  return text;
}

function serializeNode(node) {
  if (node.text !== undefined) {
    return serializeLeaf(node);
  }

  const children = node.children.map(serializeNode).join('');

  switch (node.type) {
    case 'heading-one':
      return `\\section{${children}}\n`;
    case 'heading-two':
      return `\\subsection{${children}}\n`;
    case 'heading-three':
      return `\\subsubsection{${children}}\n`;
    case 'bulleted-list':
      return `\\begin{itemize}\n${children}\\end{itemize}\n`;
    case 'numbered-list':
      return `\\begin{enumerate}\n${children}\\end{enumerate}\n`;
    case 'list-item':
      return `  \\item ${children}\n`;
    case 'block-quote':
      return `\\begin{quote}\n${children}\\end{quote}\n`;
    case 'math-block':
      return `\\[\n${node.math || children}\n\\]\n`;
    case 'math-inline':
      return `$${node.math || children}$`;
    case 'table':
      return serializeTable(node);
    case 'paragraph':
    default:
      return `${children}\n\n`;
  }
}

function serializeTable(node) {
  const rows = node.children || [];
  if (rows.length === 0) return '';
  const colCount = rows[0]?.children?.length || 1;
  const colSpec = Array(colCount).fill('l').join(' | ');
  let latex = `\\begin{tabular}{| ${colSpec} |}\n\\hline\n`;
  rows.forEach((row) => {
    const cells = (row.children || []).map((cell) =>
      cell.children.map(serializeNode).join('').trim()
    );
    latex += cells.join(' & ') + ' \\\\\n\\hline\n';
  });
  latex += '\\end{tabular}\n\n';
  return latex;
}

export function editorToLatex(nodes) {
  const body = nodes.map(serializeNode).join('');
  return `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{hyperref}

\\begin{document}

${body}
\\end{document}
`;
}

export { escapeLatex, serializeNode, serializeLeaf };
