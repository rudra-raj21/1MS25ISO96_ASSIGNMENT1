import React from 'react';
import {
  FileSearch,
  Grid,
  Lightbulb,
  FileCode2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { ResearchMode } from '../utils/modeDetector';

interface ModeSelectorProps {
  currentMode: ResearchMode;
  onSelectMode: (mode: ResearchMode) => void;
  draftStyle: 'NeurIPS' | 'ICML' | 'IEEE' | 'ACM' | 'General';
  onChangeDraftStyle: (style: 'NeurIPS' | 'ICML' | 'IEEE' | 'ACM' | 'General') => void;
  useSearchGrounding: boolean;
  onToggleSearchGrounding: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  draftStyle,
  onChangeDraftStyle,
  useSearchGrounding,
  onToggleSearchGrounding,
}) => {
  const modes: {
    id: ResearchMode;
    label: string;
    command: string;
    icon: React.ReactNode;
    desc: string;
    badgeColor: string;
  }[] = [
    {
      id: 'analyze',
      label: 'Deep-Dive',
      command: '/analyze',
      icon: <FileSearch className="w-4 h-4 text-emerald-400" />,
      desc: 'Single Paper: Thesis, Problem Formulation, Equations, Experimental Setup & Ablations',
      badgeColor: 'border-emerald-500/40 text-emerald-300',
    },
    {
      id: 'synthesize',
      label: 'Literature Matrix',
      command: '/synthesize',
      icon: <Grid className="w-4 h-4 text-cyan-400" />,
      desc: 'Multi-Paper: Taxonomy, Comparative Matrix Table & 3 Open Research Gaps',
      badgeColor: 'border-cyan-500/40 text-cyan-300',
    },
    {
      id: 'ideate',
      label: 'Hypothesis Architect',
      command: '/ideate',
      icon: <Lightbulb className="w-4 h-4 text-amber-400" />,
      desc: 'Falsifiable Hypothesis, Novel Mathematical Architecture & Ablation Protocol',
      badgeColor: 'border-amber-500/40 text-amber-300',
    },
    {
      id: 'draft',
      label: 'Manuscript Writer',
      command: '/draft',
      icon: <FileCode2 className="w-4 h-4 text-indigo-400" />,
      desc: 'IEEE / ACM / NeurIPS Style: Dense formal active-voice prose, LaTeX equations & tables',
      badgeColor: 'border-indigo-500/40 text-indigo-300',
    },
    {
      id: 'review',
      label: 'Reviewer #2',
      command: '/review',
      icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
      desc: 'Stress-Test: Reject Triggers, Baseline Fairness, Leakage Risks & Remediation Plan',
      badgeColor: 'border-rose-500/40 text-rose-300',
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Operational Research Modes</span>
        </div>

        {/* Search Grounding Toggle */}
        <button
          type="button"
          onClick={onToggleSearchGrounding}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
            useSearchGrounding
              ? 'bg-sky-950/80 border-sky-500/50 text-sky-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Google Search literature grounding for citation verification"
        >
          <span className={`w-2 h-2 rounded-full ${useSearchGrounding ? 'bg-sky-400 animate-pulse' : 'bg-slate-500'}`} />
          <span>Google Search Grounding: {useSearchGrounding ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Modes Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {modes.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onSelectMode(mode.id)}
              className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-800 border-indigo-500 shadow-xs'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                  {mode.icon}
                  {mode.label}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                  {mode.command}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{mode.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Style selector if draft mode is selected */}
      {currentMode === 'draft' && (
        <div className="flex items-center gap-3 pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Target Style:</span>
          {(['NeurIPS', 'ICML', 'IEEE', 'ACM', 'General'] as const).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => onChangeDraftStyle(style)}
              className={`px-2 py-0.5 rounded font-mono text-xs transition-colors cursor-pointer ${
                draftStyle === style
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
