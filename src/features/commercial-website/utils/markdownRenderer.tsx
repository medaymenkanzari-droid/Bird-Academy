/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — SECURE REACT MARKDOWN RENDERER
 * High-performance, zero-XSS virtual DOM parser for official documentation & tester kits.
 */

import React from 'react';
import { 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  FileText, 
  CheckSquare, 
  Square,
  ChevronRight
} from 'lucide-react';

/**
 * Sanitize a URL to prevent javascript:, data:, vbscript: execution.
 */
function sanitizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (
    trimmed.toLowerCase().startsWith('javascript:') ||
    trimmed.toLowerCase().startsWith('data:') ||
    trimmed.toLowerCase().startsWith('vbscript:')
  ) {
    return '#';
  }
  return trimmed;
}

/**
 * Parses inline text for bold, italic, code, links, status tags and checkboxes.
 */
function renderInlineText(text: string, isRtl: boolean = false): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let keyIndex = 0;

  // Regex splitting by bold (**), code (`), links ([text](url)), status tags
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\)|\b(?:PASS|FAIL|BLOCKED|NOT TESTED|CONFORME|A_CONFIRMER)\b|\[[ xX]\])/g);

  for (const token of tokens) {
    if (!token) continue;

    // Bold **text**
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      nodes.push(
        <strong key={`b-${keyIndex++}`} className="font-bold text-slate-900 dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
      continue;
    }

    // Inline code `code`
    if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      nodes.push(
        <code 
          key={`c-${keyIndex++}`} 
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-xs border border-slate-200 dark:border-slate-700"
        >
          {token.slice(1, -1)}
        </code>
      );
      continue;
    }

    // Link [text](url)
    const linkMatch = token.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const linkText = linkMatch[1];
      const linkUrl = sanitizeUrl(linkMatch[2]);
      nodes.push(
        <a
          key={`a-${keyIndex++}`}
          href={linkUrl}
          target={linkUrl.startsWith('http') ? '_blank' : undefined}
          rel={linkUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors"
        >
          {linkText}
        </a>
      );
      continue;
    }

    // Checkbox brackets [ ], [x], [X]
    if (token === '[ ]' || token === '[x]' || token === '[X]') {
      const isChecked = token.toLowerCase() === '[x]';
      nodes.push(
        <span 
          key={`chk-${keyIndex++}`} 
          className={`inline-flex items-center justify-center w-4 h-4 rounded text-xs mx-1 align-middle border font-mono ${
            isChecked 
              ? 'bg-emerald-600 text-white border-emerald-600' 
              : 'bg-white dark:bg-slate-800 text-transparent border-slate-300 dark:border-slate-600'
          }`}
        >
          {isChecked ? '✓' : ''}
        </span>
      );
      continue;
    }

    // Status Badges
    if (token === 'PASS' || token === 'CONFORME') {
      nodes.push(
        <span key={`s-${keyIndex++}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {token}
        </span>
      );
      continue;
    }

    if (token === 'FAIL') {
      nodes.push(
        <span key={`s-${keyIndex++}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <XCircle className="w-3 h-3 text-rose-600" />
          {token}
        </span>
      );
      continue;
    }

    if (token === 'BLOCKED') {
      nodes.push(
        <span key={`s-${keyIndex++}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          {token}
        </span>
      );
      continue;
    }

    if (token === 'NOT TESTED') {
      nodes.push(
        <span key={`s-${keyIndex++}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
          <HelpCircle className="w-3 h-3 text-slate-500" />
          {token}
        </span>
      );
      continue;
    }

    if (token === 'A_CONFIRMER') {
      nodes.push(
        <span key={`s-${keyIndex++}`} className="inline-flex items-center px-1.5 py-0.2 rounded text-[11px] font-mono font-semibold bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
          {token}
        </span>
      );
      continue;
    }

    // Default plain text
    nodes.push(<React.Fragment key={`t-${keyIndex++}`}>{token}</React.Fragment>);
  }

  return nodes;
}

export interface MarkdownRendererProps {
  content: string;
  isRtl?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isRtl = false }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let elementIndex = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trimEnd();

    // 1. Code Block (``` ... ```)
    if (line.trim().startsWith('```')) {
      const codeLang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing ```
      elements.push(
        <div key={`cb-${elementIndex++}`} className="my-4 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 text-slate-100 shadow-md">
          {codeLang && (
            <div className="px-4 py-1.5 bg-slate-800/80 border-b border-slate-700/80 text-[11px] font-mono text-slate-400">
              {codeLang}
            </div>
          )}
          <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      continue;
    }

    // 2. Headings (# H1, ## H2, ### H3, #### H4)
    if (line.startsWith('# ')) {
      const title = line.slice(2).trim();
      elements.push(
        <h1 
          key={`h1-${elementIndex++}`} 
          className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-8 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2 leading-tight"
        >
          {renderInlineText(title, isRtl)}
        </h1>
      );
      i++;
      continue;
    }

    if (line.startsWith('## ')) {
      const title = line.slice(3).trim();
      elements.push(
        <h2 
          key={`h2-${elementIndex++}`} 
          className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-3 border-b border-slate-100 dark:border-slate-800/60 pb-1.5 leading-snug"
        >
          {renderInlineText(title, isRtl)}
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith('### ')) {
      const title = line.slice(4).trim();
      elements.push(
        <h3 
          key={`h3-${elementIndex++}`} 
          className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-5 mb-2 leading-snug"
        >
          {renderInlineText(title, isRtl)}
        </h3>
      );
      i++;
      continue;
    }

    if (line.startsWith('#### ')) {
      const title = line.slice(5).trim();
      elements.push(
        <h4 
          key={`h4-${elementIndex++}`} 
          className="text-base font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2"
        >
          {renderInlineText(title, isRtl)}
        </h4>
      );
      i++;
      continue;
    }

    // 3. Horizontal Rule (---)
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(
        <hr key={`hr-${elementIndex++}`} className="my-6 border-t border-slate-200 dark:border-slate-800" />
      );
      i++;
      continue;
    }

    // 4. Blockquotes & GitHub Alerts (> [!NOTE], > [!WARNING], > [!IMPORTANT], > [!TIP], > [!CAUTION])
    if (line.trim().startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        const cleanQuoteLine = lines[i].trim().replace(/^>\s?/, '');
        quoteLines.push(cleanQuoteLine);
        i++;
      }

      const firstQuote = quoteLines[0] || '';
      let alertType: 'note' | 'warning' | 'important' | 'tip' | 'caution' | 'default' = 'default';

      if (firstQuote.includes('[!NOTE]')) alertType = 'note';
      else if (firstQuote.includes('[!WARNING]')) alertType = 'warning';
      else if (firstQuote.includes('[!IMPORTANT]')) alertType = 'important';
      else if (firstQuote.includes('[!TIP]')) alertType = 'tip';
      else if (firstQuote.includes('[!CAUTION]')) alertType = 'caution';

      const alertBodyLines = alertType === 'default' 
        ? quoteLines 
        : quoteLines.slice(1);

      const alertStyles = {
        note: {
          bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200',
          icon: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
          title: 'Note',
        },
        warning: {
          bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
          title: 'Avertissement',
        },
        important: {
          bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200',
          icon: <AlertTriangle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />,
          title: 'Important',
        },
        tip: {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
          title: 'Conseil',
        },
        caution: {
          bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200',
          icon: <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
          title: 'Attention',
        },
        default: {
          bg: 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300',
          icon: <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />,
          title: 'Remarque',
        }
      };

      const style = alertStyles[alertType];

      elements.push(
        <div 
          key={`alert-${elementIndex++}`} 
          className={`my-4 p-4 rounded-2xl border ${style.bg} flex items-start gap-3 shadow-sm`}
        >
          {style.icon}
          <div className="space-y-1 text-xs leading-relaxed flex-1">
            {alertType !== 'default' && (
              <span className="font-bold uppercase tracking-wider block text-[11px]">
                {style.title}
              </span>
            )}
            {alertBodyLines.map((abl, ablIdx) => (
              <p key={ablIdx}>{renderInlineText(abl, isRtl)}</p>
            ))}
          </div>
        </div>
      );
      continue;
    }

    // 5. Tables (| col1 | col2 |)
    if (line.trim().startsWith('|') && line.includes('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        // First line is header
        const headerCells = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map(c => c.trim());

        // Second line is separator (determines alignment)
        const sepCells = tableLines[1]
          .split('|')
          .slice(1, -1)
          .map(c => c.trim());

        const alignments = sepCells.map(c => {
          if (c.startsWith(':') && c.endsWith(':')) return 'center';
          if (c.endsWith(':')) return 'right';
          return 'left';
        });

        const bodyRows = tableLines.slice(2).map(r => {
          return r
            .split('|')
            .slice(1, -1)
            .map(c => c.trim());
        });

        elements.push(
          <div 
            key={`table-${elementIndex++}`} 
            className="my-5 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800"
          >
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold">
                  {headerCells.map((hc, hIdx) => (
                    <th 
                      key={hIdx} 
                      className={`px-4 py-3 text-${alignments[hIdx] || 'left'} font-bold tracking-tight whitespace-nowrap`}
                    >
                      {renderInlineText(hc, isRtl)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td 
                        key={cIdx} 
                        className={`px-4 py-2.5 text-${alignments[cIdx] || 'left'} text-slate-700 dark:text-slate-300 leading-relaxed`}
                      >
                        {renderInlineText(cell, isRtl)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 6. Checklists (- [ ], - [x], - [X])
    const checklistMatch = line.match(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/);
    if (checklistMatch) {
      const isChecked = checklistMatch[2].toLowerCase() === 'x';
      const itemText = checklistMatch[3];
      elements.push(
        <div 
          key={`chkitem-${elementIndex++}`} 
          className="flex items-start gap-2.5 my-1.5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed pl-1"
        >
          <div className="mt-0.5 shrink-0">
            {isChecked ? (
              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            )}
          </div>
          <div className="flex-1">{renderInlineText(itemText, isRtl)}</div>
        </div>
      );
      i++;
      continue;
    }

    // 7. Unordered Lists (- item, * item)
    if (line.match(/^(\s*)[-*]\s+(.*)$/)) {
      const listMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
      if (listMatch) {
        const itemText = listMatch[2];
        elements.push(
          <div 
            key={`li-${elementIndex++}`} 
            className="flex items-start gap-2 my-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-2"
          >
            <span className="text-indigo-500 font-bold shrink-0 leading-none mt-1.5">•</span>
            <div className="flex-1">{renderInlineText(itemText, isRtl)}</div>
          </div>
        );
        i++;
        continue;
      }
    }

    // 8. Ordered Lists (1. item, 2. item)
    const numMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const num = numMatch[2];
      const itemText = numMatch[3];
      elements.push(
        <div 
          key={`numli-${elementIndex++}`} 
          className="flex items-start gap-2 my-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-2"
        >
          <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-[11px] shrink-0 min-w-[18px]">
            {num}.
          </span>
          <div className="flex-1">{renderInlineText(itemText, isRtl)}</div>
        </div>
      );
      i++;
      continue;
    }

    // 9. Blank line
    if (!line.trim()) {
      i++;
      continue;
    }

    // 10. Regular paragraph
    elements.push(
      <p 
        key={`p-${elementIndex++}`} 
        className="my-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
      >
        {renderInlineText(line, isRtl)}
      </p>
    );
    i++;
  }

  return <div className="space-y-1 font-sans">{elements}</div>;
};

export default MarkdownRenderer;
