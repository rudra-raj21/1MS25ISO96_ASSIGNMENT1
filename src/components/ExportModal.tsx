import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, FileText } from 'lucide-react';
import { ResearchPaper } from '../types/research';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  markdownContent: string;
  activePapers: ResearchPaper[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  title,
  markdownContent,
  activePapers,
}) => {
  const [exportFormat, setExportFormat] = useState<'markdown' | 'latex' | 'bibtex'>('latex');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Convert markdown and formulas to a clean compilable LaTeX template
  const generateLatex = () => {
    // Generate BibTeX entries
    const bibEntries = activePapers
      .map((p) => {
        const key = (p.authors.split(',')[0]?.split(' ').pop() || 'author').toLowerCase() + (p.year || '2025');
        return `@article{${key},
  author = {${p.authors}},
  title = {${p.title}},
  year = {${p.year || 2025}},
  journal = {${p.venue || 'Preprint'}},
  ${p.arxivId ? `eprint = {${p.arxivId}},` : ''}
}`;
      })
      .join('\n\n');

    return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath,amssymb,amsfonts,amsthm}
\\usepackage{booktabs}
\\usepackage{hyperref}
\\usepackage{geometry}
\\geometry{margin=1in}

\\title{${title.replace(/[#*_]/g, '')}}
\\author{Lumina Academic Research Scientist AI}
\\date{\\today}

\\begin{document}
\\maketitle

% ==========================================
% Academic Research Content
% ==========================================
${markdownContent
  .replace(/### (.*)/g, '\\subsubsection*{$1}')
  .replace(/## (.*)/g, '\\subsection*{$1}')
  .replace(/# (.*)/g, '\\section*{$1}')
  .replace(/\*\*(.*?)\*\*/g, '\\textbf{$1}')
  .replace(/\[Citation Needed - Verify Source\]/g, '\\textbf{[Citation Needed]}')
  .replace(/\[Extracted Fact\]/g, '\\textsc{[Fact]}')
  .replace(/\[Verified Grounding\]/g, '\\textsc{[Grounding]}')
  .replace(/\[Analytical Inference\]/g, '\\textsc{[Inference]}')}

% ==========================================
% Bibliography
% ==========================================
\\begin{thebibliography}{99}
${activePapers
  .map(
    (p, idx) =>
      `\\bibitem{ref${idx + 1}} ${p.authors}. \\emph{${p.title}}. ${p.venue || 'Preprint'}, ${p.year || 2025}.`
  )
  .join('\n')}
\\end{thebibliography}

\\end{document}

% ==========================================
% BibTeX References
% ==========================================
/*
${bibEntries}
*/`;
  };

  const generateBibtex = () => {
    if (activePapers.length === 0) return '% No papers currently selected in active corpus';
    return activePapers
      .map((p) => {
        const cleanAuthor = p.authors.split(',')[0]?.trim().split(/\s+/).pop()?.toLowerCase() || 'author';
        const key = `${cleanAuthor}${p.year || '2025'}`;
        return `@article{${key},
  title = {${p.title}},
  author = {${p.authors}},
  year = {${p.year || 2025}},
  journal = {${p.venue || 'arXiv preprint'}},
  ${p.arxivId ? `archivePrefix = {arXiv},\n  eprint = {${p.arxivId}},` : ''}
  ${p.url ? `url = {${p.url}}` : ''}
}`;
      })
      .join('\n\n');
  };

  const currentContent =
    exportFormat === 'latex'
      ? generateLatex()
      : exportFormat === 'bibtex'
      ? generateBibtex()
      : markdownContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = exportFormat === 'latex' ? 'tex' : exportFormat === 'bibtex' ? 'bib' : 'md';
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lumina_academic_${exportFormat}_${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Export Academic Manuscript / Artifact</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
            aria-label="Close export dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setExportFormat('latex')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                exportFormat === 'latex' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              LaTeX Document (.tex)
            </button>
            <button
              type="button"
              onClick={() => setExportFormat('markdown')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                exportFormat === 'markdown' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Markdown (.md)
            </button>
            <button
              type="button"
              onClick={() => setExportFormat('bibtex')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                exportFormat === 'bibtex' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              BibTeX Citations (.bib)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Code Content View */}
        <div className="p-4 flex-1 overflow-y-auto">
          <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
            <code>{currentContent}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
