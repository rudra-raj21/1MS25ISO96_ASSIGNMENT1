import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  ExternalLink,
  Upload,
  FileText,
  Search,
  CheckCircle,
  X,
  FileCheck,
  DownloadCloud,
} from 'lucide-react';
import { ResearchPaper } from '../types/research';
import { SAMPLE_PAPERS } from '../data/samplePapers';

interface PaperDrawerProps {
  papers: ResearchPaper[];
  onTogglePaper: (id: string) => void;
  onAddPaper: (paper: ResearchPaper) => void;
  onRemovePaper: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const PaperDrawer: React.FC<PaperDrawerProps> = ({
  papers,
  onTogglePaper,
  onAddPaper,
  onRemovePaper,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'arxiv' | 'manual' | 'benchmarks'>('benchmarks');
  const [arxivInput, setArxivInput] = useState('');
  const [isFetchingArxiv, setIsFetchingArxiv] = useState(false);
  const [arxivError, setArxivError] = useState('');

  // Manual paper state
  const [manualTitle, setManualTitle] = useState('');
  const [manualAuthors, setManualAuthors] = useState('');
  const [manualYear, setManualYear] = useState(new Date().getFullYear().toString());
  const [manualVenue, setManualVenue] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [viewingPaper, setViewingPaper] = useState<ResearchPaper | null>(null);

  const handleFetchArxiv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arxivInput.trim()) return;

    setIsFetchingArxiv(true);
    setArxivError('');

    try {
      const res = await fetch(`/api/arxiv/fetch?id=${encodeURIComponent(arxivInput.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch arXiv paper.');
      }

      const newPaper: ResearchPaper = {
        id: `arxiv-${data.arxivId || Date.now()}`,
        title: data.title,
        authors: data.authors,
        year: data.year,
        venue: data.venue,
        arxivId: data.arxivId,
        url: data.url,
        pdfUrl: data.pdfUrl,
        content: data.content || data.abstract,
        dateAdded: new Date().toISOString().split('T')[0],
        selected: true,
      };

      onAddPaper(newPaper);
      setArxivInput('');
      setActiveTab('benchmarks');
    } catch (err: any) {
      setArxivError(err.message || 'Error fetching paper metadata from arXiv.');
    } finally {
      setIsFetchingArxiv(false);
    }
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualContent.trim()) return;

    const newPaper: ResearchPaper = {
      id: `paper-${Date.now()}`,
      title: manualTitle.trim(),
      authors: manualAuthors.trim() || 'Unspecified',
      year: parseInt(manualYear, 10) || new Date().getFullYear(),
      venue: manualVenue.trim() || 'Manuscript Draft / Working Paper',
      content: manualContent.trim(),
      dateAdded: new Date().toISOString().split('T')[0],
      selected: true,
    };

    onAddPaper(newPaper);
    setManualTitle('');
    setManualAuthors('');
    setManualContent('');
    setManualVenue('');
    setActiveTab('benchmarks');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const newPaper: ResearchPaper = {
        id: `upload-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        authors: 'Imported Document',
        year: new Date().getFullYear(),
        venue: `Local File (${file.name})`,
        content: text,
        dateAdded: new Date().toISOString().split('T')[0],
        selected: true,
      };

      onAddPaper(newPaper);
      setActiveTab('benchmarks');
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  const selectedCount = papers.filter((p) => p.selected).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white">Academic Literature Corpus</h2>
              <p className="text-xs text-slate-400">
                {selectedCount} of {papers.length} paper{papers.length === 1 ? '' : 's'} active in context window
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('benchmarks')}
            className={`pb-2 px-3 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'benchmarks'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Current Papers ({papers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('arxiv')}
            className={`pb-2 px-3 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'arxiv'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Fetch ArXiv ID
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`pb-2 px-3 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'manual'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Paste / Upload Document
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'benchmarks' && (
            <div className="space-y-4">
              {/* Quick load presets banner */}
              <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-indigo-200">Load Landmark Benchmark Papers</h4>
                  <p className="text-[11px] text-slate-400">
                    Instant testing with Transformer (2017), Mamba (2023), &amp; FlashAttention-2 (2023).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    SAMPLE_PAPERS.forEach((sample) => {
                      if (!papers.some((p) => p.title === sample.title)) {
                        onAddPaper(sample);
                      }
                    });
                  }}
                  className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shrink-0 cursor-pointer shadow-xs"
                >
                  Load All 3
                </button>
              </div>

              {/* Papers List */}
              {papers.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <FileText className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-sm">No research papers in workspace yet.</p>
                  <p className="text-xs">Import via arXiv ID, load presets, or upload below.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {papers.map((paper) => (
                    <div
                      key={paper.id}
                      className={`p-3.5 rounded-lg border transition-all ${
                        paper.selected
                          ? 'bg-slate-800/80 border-indigo-500/50 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={paper.selected || false}
                            onChange={() => onTogglePaper(paper.id)}
                            id={`paper-check-${paper.id}`}
                            className="mt-1 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900 cursor-pointer"
                          />
                          <div className="min-w-0 flex-1">
                            <label
                              htmlFor={`paper-check-${paper.id}`}
                              className="text-sm font-semibold text-white block truncate cursor-pointer hover:text-indigo-300 transition-colors"
                            >
                              {paper.title}
                            </label>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{paper.authors}</p>
                            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                              {paper.year && <span>{paper.year}</span>}
                              {paper.venue && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[200px]">{paper.venue}</span>
                                </>
                              )}
                              {paper.arxivId && (
                                <>
                                  <span>•</span>
                                  <span className="text-indigo-400 font-mono">arXiv:{paper.arxivId}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setViewingPaper(paper)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-300 hover:bg-slate-700/60 transition-colors"
                            title="View paper text & formulation"
                          >
                            <FileCheck className="w-4 h-4" />
                          </button>
                          {paper.url && (
                            <a
                              href={paper.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-slate-700/60 transition-colors"
                              title="Open original arXiv or venue URL"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => onRemovePaper(paper.id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-700/60 transition-colors"
                            title="Remove from workspace"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'arxiv' && (
            <div className="space-y-4">
              <form onSubmit={handleFetchArxiv} className="space-y-3">
                <div>
                  <label htmlFor="arxiv-input-id" className="block text-xs font-semibold text-slate-300 mb-1">
                    arXiv Identifier or URL
                  </label>
                  <div className="relative">
                    <input
                      id="arxiv-input-id"
                      type="text"
                      value={arxivInput}
                      onChange={(e) => setArxivInput(e.target.value)}
                      placeholder="e.g. 1706.03762 or https://arxiv.org/abs/2312.00752"
                      className="w-full px-3 py-2 pl-9 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                    />
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Fetches verified title, authors, date, categories, and abstract directly from arXiv Atom API.
                  </p>
                </div>

                {arxivError && (
                  <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-800">
                    {arxivError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isFetchingArxiv || !arxivInput.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  {isFetchingArxiv ? (
                    <>
                      <DownloadCloud className="w-4 h-4 animate-bounce" />
                      Fetching Paper Metadata...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Import Paper from arXiv
                    </>
                  )}
                </button>
              </form>

              <div className="pt-3 border-t border-slate-800">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Popular arXiv IDs for testing:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: '1706.03762', name: 'Transformer (Attention)' },
                    { id: '2312.00752', name: 'Mamba (SSM)' },
                    { id: '2307.08691', name: 'FlashAttention-2' },
                    { id: '2005.14165', name: 'GPT-3 (Few-Shot)' },
                    { id: '2412.19437', name: 'DeepSeek-V3' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setArxivInput(item.id)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs border border-slate-700 transition-colors"
                    >
                      {item.name} ({item.id})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-4">
              {/* File upload dropzone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Upload File (.txt, .md, .tex, .bib)</label>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-lg bg-slate-950/60 hover:bg-slate-900/60 cursor-pointer transition-colors text-center">
                  <Upload className="w-6 h-6 text-indigo-400 mb-1" />
                  <span className="text-xs font-medium text-slate-300">Click to upload academic document</span>
                  <span className="text-[10px] text-slate-500">Supports text, markdown, LaTeX (.tex), and BibTeX (.bib)</span>
                  <input
                    type="file"
                    accept=".txt,.md,.tex,.bib,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-800"></div>
                <span className="shrink mx-2 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Or Paste Directly</span>
                <div className="grow border-t border-slate-800"></div>
              </div>

              <form onSubmit={handleAddManual} className="space-y-3">
                <div>
                  <label htmlFor="manual-paper-title" className="block text-xs font-semibold text-slate-300 mb-1">Paper Title *</label>
                  <input
                    id="manual-paper-title"
                    type="text"
                    required
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g. Scalable Diffusion Models with Transformers"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="manual-paper-authors" className="block text-xs font-semibold text-slate-300 mb-1">Authors</label>
                    <input
                      id="manual-paper-authors"
                      type="text"
                      value={manualAuthors}
                      onChange={(e) => setManualAuthors(e.target.value)}
                      placeholder="e.g. Peebles & Xie"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="manual-paper-year" className="block text-xs font-semibold text-slate-300 mb-1">Year</label>
                    <input
                      id="manual-paper-year"
                      type="text"
                      value={manualYear}
                      onChange={(e) => setManualYear(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="manual-paper-venue" className="block text-xs font-semibold text-slate-300 mb-1">Venue / Conference</label>
                  <input
                    id="manual-paper-venue"
                    type="text"
                    value={manualVenue}
                    onChange={(e) => setManualVenue(e.target.value)}
                    placeholder="e.g. ICCV 2023 or arXiv"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="manual-paper-content" className="block text-xs font-semibold text-slate-300 mb-1">
                    Abstract / Methodology / Mathematical Details *
                  </label>
                  <textarea
                    id="manual-paper-content"
                    rows={6}
                    required
                    value={manualContent}
                    onChange={(e) => setManualContent(e.target.value)}
                    placeholder="Paste the abstract, methodology formulas, loss functions, or experimental results..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!manualTitle.trim() || !manualContent.trim()}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add to Active Corpus
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Paper Text Preview Modal */}
        {viewingPaper && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{viewingPaper.title}</h3>
                  <p className="text-xs text-slate-400">{viewingPaper.authors} ({viewingPaper.year})</p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingPaper(null)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                {viewingPaper.content}
              </div>
              <div className="p-3 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingPaper(null)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
