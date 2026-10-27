import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  BookOpen,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  FileCode,
  FileText,
  AlertCircle,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { ResearchPaper, ResearchMessage, GroundingSource } from './types/research';
import { SAMPLE_PAPERS } from './data/samplePapers';
import { ResearchMode, detectResearchMode } from './utils/modeDetector';
import { parseEpistemicContent } from './utils/citationVerifier';
import { MathRenderer } from './components/MathRenderer';
import { FollowUpActions } from './components/FollowUpActions';
import { EpistemicBanner } from './components/EpistemicBanner';
import { PaperDrawer } from './components/PaperDrawer';
import { ModeSelector } from './components/ModeSelector';
import { ExportModal } from './components/ExportModal';

export default function App() {
  // Papers state: initialize with Transformer and Mamba active
  const [papers, setPapers] = useState<ResearchPaper[]>(SAMPLE_PAPERS);
  const [isPaperDrawerOpen, setIsPaperDrawerOpen] = useState(false);

  // Mode and settings
  const [currentMode, setCurrentMode] = useState<ResearchMode>('analyze');
  const [draftStyle, setDraftStyle] = useState<'NeurIPS' | 'ICML' | 'IEEE' | 'ACM' | 'General'>('NeurIPS');
  const [useSearchGrounding, setUseSearchGrounding] = useState(true);

  // Input & Messaging
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ResearchMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Export Modal state
  const [exportModalData, setExportModalData] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
  }>({
    isOpen: false,
    title: '',
    content: '',
  });

  const [rawViewMsgIds, setRawViewMsgIds] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const activePapers = papers.filter((p) => p.selected);

  const handleTogglePaper = (id: string) => {
    setPapers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const handleAddPaper = (newPaper: ResearchPaper) => {
    setPapers((prev) => [newPaper, ...prev]);
  };

  const handleRemovePaper = (id: string) => {
    setPapers((prev) => prev.filter((p) => p.id !== id));
  };

  // Toggle raw view for a specific message
  const toggleRawView = (id: string) => {
    setRawViewMsgIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const executeResearchQuery = async (queryText: string, forcedMode?: ResearchMode) => {
    if (!queryText.trim() && activePapers.length === 0) return;

    // Detect mode from input text or use current mode
    const detection = detectResearchMode(
      queryText,
      activePapers.length > 1,
      activePapers.length === 1
    );

    const targetMode = forcedMode || (detection.explicitCommand ? detection.mode : currentMode);
    const targetStyle = detection.draftStyle || draftStyle;

    const userMessage: ResearchMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryText,
      mode: targetMode,
      draftStyle: targetStyle,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      papersReferenced: activePapers.map((p) => p.title),
      rawPrompt: queryText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/research/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryText,
          mode: targetMode,
          contextDocs: activePapers.map((p) => ({
            title: p.title,
            authors: p.authors,
            year: p.year,
            venue: p.venue,
            arxivId: p.arxivId,
            url: p.url,
            content: p.content,
          })),
          conversationHistory: messages.slice(-4).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          useSearchGrounding,
          draftStyle: targetStyle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server returned ${response.status}`);
      }

      const assistantMessage: ResearchMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.text,
        mode: targetMode,
        draftStyle: targetStyle,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingSources: data.groundingSources,
        papersReferenced: activePapers.map((p) => p.title),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Error in research query:', err);
      setError(err.message || 'Failed to complete research execution. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() && activePapers.length === 0) return;
    executeResearchQuery(inputPrompt);
  };

  // Quick preset queries for instant testing
  const samplePills = [
    {
      label: '/analyze Mamba SSM',
      query: '/analyze Provide a rigorous technical deep-dive into Mamba’s selective state space mechanism and its hardware-aware parallel scan.',
      mode: 'analyze' as ResearchMode,
    },
    {
      label: '/synthesize Matrix',
      query: '/synthesize Synthesize a comparative literature matrix comparing Transformer Self-Attention, Mamba SSM, and FlashAttention-2 on sequence scaling, memory, and associative recall bottlenecks.',
      mode: 'synthesize' as ResearchMode,
    },
    {
      label: '/ideate Hybrid Architecture',
      query: '/ideate Hypothesize a sub-quadratic hybrid architecture combining selective SSMs with top-k sparse attention to achieve O(N) memory while preserving needle-in-a-haystack retrieval.',
      mode: 'ideate' as ResearchMode,
    },
    {
      label: '/draft NeurIPS Section',
      query: '/draft Write a formal Methodology & Problem Formulation section in NeurIPS style defining the state-space discretization with exact LaTeX equations and tensor dimensions.',
      mode: 'draft' as ResearchMode,
    },
    {
      label: '/review Stress-Test',
      query: '/review Act as Reviewer #2. Rigorously critique the claim that selective SSMs can entirely replace quadratic self-attention without capacity degradation on long-context code synthesis.',
      mode: 'review' as ResearchMode,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Academic Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white">Lumina</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/60 uppercase">
                  Principal Investigator AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Quantitative Sciences &amp; Computer Science Academic Research Workstation
              </p>
            </div>
          </div>

          {/* Action buttons & Corpus Drawer Trigger */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsPaperDrawerOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer shadow-xs"
              aria-label="Open literature corpus drawer"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Corpus Workspace</span>
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-mono text-[10px]">
                {activePapers.length}/{papers.length}
              </span>
            </button>
          </div>
        </div>

        {/* Epistemic Core Principles Bar */}
        <div className="bg-slate-950/70 border-t border-slate-800/80 px-4 py-1.5 text-[11px] text-slate-400 hidden sm:block">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                Rigorous Epistemics:
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <span>🛡️</span> Zero Hallucination Guarantee
              </span>
              <span className="flex items-center gap-1 text-indigo-300 font-medium">
                <span>📐</span> Mathematical Precision (LaTeX)
              </span>
              <span className="flex items-center gap-1 text-cyan-300 font-medium">
                <span>🔬</span> Empirical O(N) Complexity &amp; Ablations
              </span>
              <span className="flex items-center gap-1 text-rose-300 font-medium">
                <span>🔍</span> Reviewer #2 Stress-Testing
              </span>
            </div>
            <div className="text-slate-500 font-mono text-[10px]">
              Grounding: {useSearchGrounding ? 'Google Search Active' : 'Off'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col space-y-6">
        {/* Mode Selector */}
        <ModeSelector
          currentMode={currentMode}
          onSelectMode={(mode) => setCurrentMode(mode)}
          draftStyle={draftStyle}
          onChangeDraftStyle={(style) => setDraftStyle(style)}
          useSearchGrounding={useSearchGrounding}
          onToggleSearchGrounding={() => setUseSearchGrounding((prev) => !prev)}
        />

        {/* Active Corpus Bar (Noticeable indicator of what papers are currently in the context window) */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-slate-400 font-medium shrink-0">Active Context:</span>
            {activePapers.length === 0 ? (
              <span className="text-amber-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> No papers active. Click "Corpus Workspace" to activate papers or import via arXiv.
              </span>
            ) : (
              activePapers.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-200 border border-slate-700 font-medium shrink-0"
                >
                  <BookOpen className="w-3 h-3 text-indigo-400" />
                  <span className="max-w-[180px] truncate">{p.title}</span>
                </span>
              ))
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsPaperDrawerOpen(true)}
            className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium shrink-0 cursor-pointer"
          >
            Manage Corpus ({papers.length} total)
          </button>
        </div>

        {/* Quick Benchmark Questions */}
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Benchmark Academic Inquiries</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {samplePills.map((pill, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentMode(pill.mode);
                    executeResearchQuery(pill.query, pill.mode);
                  }}
                  className="p-3 text-left rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 transition-all text-xs cursor-pointer group shadow-xs"
                >
                  <div className="font-bold text-indigo-300 group-hover:text-indigo-200 flex items-center justify-between mb-1">
                    <span>{pill.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Run →</span>
                  </div>
                  <p className="text-slate-400 line-clamp-2 leading-relaxed">{pill.query}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages / Scientific Artifacts Feed */}
        {messages.length > 0 && (
          <div className="space-y-6">
            {messages.map((message) => {
              const isAssistant = message.role === 'assistant';
              const epistemicAnalysis = isAssistant ? parseEpistemicContent(message.content) : null;
              const isRawView = rawViewMsgIds[message.id] || false;

              return (
                <div
                  key={message.id}
                  className={`rounded-xl border transition-all ${
                    isAssistant
                      ? 'bg-slate-900/90 border-slate-800 shadow-xl'
                      : 'bg-indigo-950/20 border-indigo-900/40'
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-800/80 bg-slate-950/50 rounded-t-xl text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold ${
                          isAssistant ? 'text-indigo-300' : 'text-slate-300'
                        }`}
                      >
                        {isAssistant ? 'Lumina (PI AI)' : 'Researcher'}
                      </span>
                      {message.mode && (
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-indigo-300 border border-slate-700 uppercase">
                          /{message.mode}
                        </span>
                      )}
                      {message.draftStyle && message.mode === 'draft' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                          {message.draftStyle} Style
                        </span>
                      )}
                      <span className="text-slate-500">{message.timestamp}</span>
                    </div>

                    {isAssistant && (
                      <div className="flex items-center gap-2">
                        {/* Toggle Rendered vs Raw Markdown/LaTeX */}
                        <button
                          type="button"
                          onClick={() => toggleRawView(message.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors cursor-pointer"
                        >
                          <FileCode className="w-3 h-3 text-indigo-400" />
                          <span>{isRawView ? 'Rendered View' : 'Raw LaTeX/MD'}</span>
                        </button>

                        {/* Export Button */}
                        <button
                          type="button"
                          onClick={() =>
                            setExportModalData({
                              isOpen: true,
                              title: `Lumina Research - ${message.mode || 'Manuscript'}`,
                              content: message.content,
                            })
                          }
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Export / Cite</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Message Body */}
                  <div className="p-4 sm:p-6">
                    {/* Epistemic Verification Banner for assistant messages */}
                    {isAssistant && epistemicAnalysis && (
                      <EpistemicBanner
                        analysis={epistemicAnalysis}
                        groundingSources={message.groundingSources}
                      />
                    )}

                    {/* Content Rendering */}
                    {isRawView ? (
                      <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        <code>{message.content}</code>
                      </pre>
                    ) : (
                      <MathRenderer content={message.content} />
                    )}

                    {/* Interactive Follow-up Actions */}
                    {isAssistant && epistemicAnalysis && epistemicAnalysis.followUpActions.length > 0 && (
                      <FollowUpActions
                        actions={epistemicAnalysis.followUpActions}
                        onSelectAction={(actionText) => {
                          setInputPrompt(actionText);
                          textareaRef.current?.focus();
                        }}
                        isLoading={isLoading}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="p-6 rounded-xl border border-indigo-500/40 bg-slate-900/90 shadow-xl space-y-3 animate-pulse">
                <div className="flex items-center gap-2 text-indigo-300 text-sm font-semibold">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Synthesizing Literature &amp; Mathematical Formulation...</span>
                </div>
                <p className="text-xs text-slate-400">
                  Checking epistemic integrity, verifying LaTeX notations, computing algorithmic bounds ($O$), and grounding citations with Google Search.
                </p>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden w-full">
                  <div className="h-full bg-linear-to-r from-indigo-500 to-purple-500 w-2/3 animate-[shimmer_1.5s_infinite]" />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl border border-rose-800 bg-rose-950/40 text-rose-200 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-rose-300">Execution Error</div>
                  <div className="text-xs mt-1">{error}</div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Prompt Console (Sticky at bottom) */}
        <div className="sticky bottom-4 z-30 pt-2">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-slate-700 bg-slate-900/95 shadow-2xl p-2.5 backdrop-blur-md focus-within:border-indigo-500 transition-colors"
          >
            {/* Context Pills above textarea */}
            <div className="flex items-center justify-between px-2 pb-2 text-[11px] text-slate-400 border-b border-slate-800 mb-2">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="text-indigo-400 font-mono font-bold">/{currentMode}</span>
                <span>mode active</span>
                <span>•</span>
                <span>{activePapers.length} paper{activePapers.length === 1 ? '' : 's'} loaded</span>
              </div>
              <span className="text-slate-500">
                Tip: Type <code className="text-indigo-300 font-mono">/analyze</code>, <code className="text-indigo-300 font-mono">/synthesize</code>, <code className="text-indigo-300 font-mono">/ideate</code>, <code className="text-indigo-300 font-mono">/draft</code>, or <code className="text-indigo-300 font-mono">/review</code>
              </span>
            </div>

            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                rows={2}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (inputPrompt.trim() || activePapers.length > 0) {
                      handleSubmit(e);
                    }
                  }
                }}
                placeholder={
                  activePapers.length > 0
                    ? `Instruct Lumina (e.g. /synthesize compare attention mechanisms, or /review stress-test baseline fairness)...`
                    : `Enter research hypothesis, paper text, or slash command...`
                }
                className="w-full px-3 py-1.5 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden resize-none leading-relaxed font-sans"
              />

              <button
                type="submit"
                disabled={isLoading || (!inputPrompt.trim() && activePapers.length === 0)}
                className="flex items-center justify-center p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition-colors cursor-pointer shrink-0 shadow-xs"
                aria-label="Send research instruction"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Slide-over Literature Corpus Drawer */}
      <PaperDrawer
        isOpen={isPaperDrawerOpen}
        onClose={() => setIsPaperDrawerOpen(false)}
        papers={papers}
        onTogglePaper={handleTogglePaper}
        onAddPaper={handleAddPaper}
        onRemovePaper={handleRemovePaper}
      />

      {/* Export / Cite Modal */}
      <ExportModal
        isOpen={exportModalData.isOpen}
        onClose={() => setExportModalData((prev) => ({ ...prev, isOpen: false }))}
        title={exportModalData.title}
        markdownContent={exportModalData.content}
        activePapers={activePapers}
      />
    </div>
  );
}
