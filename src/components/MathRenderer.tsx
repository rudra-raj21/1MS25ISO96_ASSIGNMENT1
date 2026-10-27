import React, { useMemo } from 'react';
import katex from 'katex';
import { Copy, Check, AlertTriangle, BookOpen, Search, Lightbulb } from 'lucide-react';

interface MathRendererProps {
  content: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Parse text into structured blocks: display math, code blocks, tables, headings, paragraphs
  const parsedElements = useMemo(() => {
    if (!content) return [];

    // First, split by code blocks and display math blocks ($$...$$)
    const blocks: { type: 'code' | 'math_display' | 'markdown'; raw: string; lang?: string }[] = [];
    
    // Regular expression to identify ```lang ... ``` and $$...$$
    const blockRegex = /(```(\w*)\n([\s\S]*?)```)|(\$\$([\s\S]*?)\$\$)|(\\\[([\s\S]*?)\\\])/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = blockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        blocks.push({
          type: 'markdown',
          raw: content.substring(lastIndex, match.index),
        });
      }

      if (match[1]) {
        // Code block
        blocks.push({
          type: 'code',
          raw: match[3],
          lang: match[2] || 'text',
        });
      } else if (match[4]) {
        // $$...$$
        blocks.push({
          type: 'math_display',
          raw: match[5].trim(),
        });
      } else if (match[6]) {
        // \[...\]
        blocks.push({
          type: 'math_display',
          raw: match[7].trim(),
        });
      }

      lastIndex = blockRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      blocks.push({
        type: 'markdown',
        raw: content.substring(lastIndex),
      });
    }

    return blocks;
  }, [content]);

  // Helper to render inline math $...$ or \(...\) within text
  const renderInlineContent = (text: string) => {
    // Replace epistemic markers first with custom tokens or process segments
    const parts = text.split(/(\$[^\$]+?\$|\\\(.+?\\\)|\*+.*?\*+|\[Extracted Fact\]|\[Verified Grounding\]|\[Verified Source\]|\[Analytical Inference(?:(?:\/)?Speculation)?\]|\[Citation Needed\s*-\s*Verify Source\])/g);

    return parts.map((part, idx) => {
      if (!part) return null;

      // Epistemic badges
      if (part === '[Extracted Fact]') {
        return (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-2 py-0.5 my-0.5 rounded text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-xs"
            title="Directly extracted from user-provided papers/documents"
          >
            <BookOpen className="w-3 h-3 text-emerald-400" />
            Extracted Fact
          </span>
        );
      }
      if (part === '[Verified Grounding]' || part === '[Verified Source]') {
        return (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-2 py-0.5 my-0.5 rounded text-xs font-semibold bg-sky-950/80 text-sky-300 border border-sky-500/40 shadow-xs"
            title="Grounded in verified academic databases and Google Search"
          >
            <Search className="w-3 h-3 text-sky-400" />
            Verified Grounding
          </span>
        );
      }
      if (/^\[Analytical Inference/i.test(part)) {
        return (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-2 py-0.5 my-0.5 rounded text-xs font-semibold bg-purple-950/80 text-purple-300 border border-purple-500/40 shadow-xs"
            title="Analytical reasoning and extrapolation by Lumina"
          >
            <Lightbulb className="w-3 h-3 text-purple-400" />
            Analytical Inference
          </span>
        );
      }
      if (/^\[Citation Needed\s*-\s*Verify Source\]/i.test(part)) {
        return (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-2 py-0.5 my-0.5 rounded text-xs font-bold bg-amber-950/90 text-amber-300 border border-amber-500/60 shadow-xs animate-pulse"
            title="Unverified citation explicitly flagged under Zero-Hallucination principle"
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Citation Needed - Verify Source
          </span>
        );
      }

      // Inline LaTeX math: $...$
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const math = part.slice(1, -1);
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={idx}
              className="inline-math px-1 py-0.5 mx-0.5 rounded bg-slate-900/60 font-mono text-indigo-200"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <code key={idx} className="text-amber-300 font-mono text-xs">{part}</code>;
        }
      }

      // Inline LaTeX math: \(...\)
      if (part.startsWith('\\(') && part.endsWith('\\)') && part.length > 4) {
        const math = part.slice(2, -2);
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={idx}
              className="inline-math px-1 py-0.5 mx-0.5 rounded bg-slate-900/60 font-mono text-indigo-200"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <code key={idx} className="text-amber-300 font-mono text-xs">{part}</code>;
        }
      }

      // Bold text: **...**
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={idx} className="font-semibold text-slate-100">
            {part.slice(2, -2)}
          </strong>
        );
      }

      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="space-y-4 text-slate-200 text-[15px] leading-relaxed font-sans">
      {parsedElements.map((block, index) => {
        if (block.type === 'code') {
          return (
            <div
              key={index}
              className="relative my-4 rounded-lg overflow-hidden border border-slate-700/80 bg-slate-900 shadow-md"
            >
              <div className="flex items-center justify-between px-4 py-1.5 bg-slate-800/90 border-b border-slate-700/80 text-xs font-mono text-slate-400">
                <span>{block.lang || 'code'}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(block.raw, index)}
                  className="flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-pointer px-2 py-0.5 rounded hover:bg-slate-700/60"
                  aria-label="Copy code block"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-200 leading-normal">
                <code>{block.raw}</code>
              </pre>
            </div>
          );
        }

        if (block.type === 'math_display') {
          let mathHtml = '';
          try {
            mathHtml = katex.renderToString(block.raw, {
              displayMode: true,
              throwOnError: false,
            });
          } catch {
            mathHtml = `<pre class="text-amber-400 text-xs">${block.raw}</pre>`;
          }

          return (
            <div
              key={index}
              className="my-4 py-3 px-4 rounded-lg bg-slate-900/90 border border-indigo-500/20 overflow-x-auto shadow-inner text-center text-indigo-100"
            >
              <div dangerouslySetInnerHTML={{ __html: mathHtml }} />
            </div>
          );
        }

        // Markdown block: split by lines to handle headers, lists, tables, paragraphs
        const lines = block.raw.split('\n');
        const elements: React.ReactNode[] = [];
        let inTable = false;
        let tableRows: string[][] = [];
        let tableAlignments: string[] = [];

        const flushTable = (tIdx: number) => {
          if (tableRows.length === 0) return;
          const header = tableRows[0];
          const body = tableRows.slice(1);

          elements.push(
            <div key={`table-${tIdx}`} className="my-4 overflow-x-auto rounded-lg border border-slate-700/70 bg-slate-900/80 shadow-xs">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-800 text-slate-200 font-semibold border-b border-slate-700">
                  <tr>
                    {header.map((col, cIdx) => (
                      <th key={cIdx} className="px-4 py-2.5 whitespace-nowrap border-r border-slate-700/60 last:border-r-0">
                        {renderInlineContent(col.trim())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {body.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-2 text-slate-300 border-r border-slate-800/60 last:border-r-0 align-top">
                          {renderInlineContent(cell.trim())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          tableRows = [];
          tableAlignments = [];
          inTable = false;
        };

        for (let lIdx = 0; lIdx < lines.length; lIdx++) {
          const line = lines[lIdx];
          const trimmed = line.trim();

          // Table detection
          if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            const cells = trimmed
              .slice(1, -1)
              .split('|')
              .map(c => c.trim());

            // Check if delimiter row like | --- | --- |
            if (cells.every(c => /^:?-+:?$/.test(c))) {
              inTable = true;
              tableAlignments = cells;
              continue;
            }

            inTable = true;
            tableRows.push(cells);
            continue;
          } else if (inTable) {
            flushTable(lIdx);
          }

          if (!trimmed) {
            continue;
          }

          // Headers
          if (trimmed.startsWith('### ')) {
            elements.push(
              <h3 key={lIdx} className="text-lg font-bold text-indigo-300 tracking-wide mt-5 mb-2 pb-1 border-b border-indigo-900/40 flex items-center gap-2">
                {renderInlineContent(trimmed.slice(4))}
              </h3>
            );
            continue;
          }
          if (trimmed.startsWith('## ')) {
            elements.push(
              <h2 key={lIdx} className="text-xl font-bold text-indigo-200 tracking-tight mt-6 mb-3 pb-1.5 border-b border-slate-700/80">
                {renderInlineContent(trimmed.slice(3))}
              </h2>
            );
            continue;
          }
          if (trimmed.startsWith('# ')) {
            elements.push(
              <h1 key={lIdx} className="text-2xl font-extrabold text-white tracking-tight mt-6 mb-3">
                {renderInlineContent(trimmed.slice(2))}
              </h1>
            );
            continue;
          }

          // Unordered list
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            elements.push(
              <div key={lIdx} className="flex items-start gap-2.5 my-1.5 ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                <div className="flex-1">{renderInlineContent(trimmed.slice(2))}</div>
              </div>
            );
            continue;
          }

          // Ordered list
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            elements.push(
              <div key={lIdx} className="flex items-start gap-2.5 my-1.5 ml-2">
                <span className="font-mono text-xs font-semibold text-indigo-400 w-5 text-right shrink-0 mt-0.5">
                  {numMatch[1]}.
                </span>
                <div className="flex-1">{renderInlineContent(numMatch[2])}</div>
              </div>
            );
            continue;
          }

          // Blockquote
          if (trimmed.startsWith('> ')) {
            elements.push(
              <blockquote
                key={lIdx}
                className="my-3 pl-4 border-l-2 border-indigo-500/70 italic text-slate-300 bg-indigo-950/20 py-1 rounded-r"
              >
                {renderInlineContent(trimmed.slice(2))}
              </blockquote>
            );
            continue;
          }

          // Standard paragraph
          elements.push(
            <p key={lIdx} className="my-2 leading-relaxed">
              {renderInlineContent(line)}
            </p>
          );
        }

        if (inTable) {
          flushTable(lines.length);
        }

        return <div key={index}>{elements}</div>;
      })}
    </div>
  );
};
