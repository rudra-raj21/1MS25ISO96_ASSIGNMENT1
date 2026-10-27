import React from 'react';
import { ShieldCheck, AlertTriangle, BookOpen, Search, Lightbulb, ExternalLink } from 'lucide-react';
import { VerificationAnalysis } from '../utils/citationVerifier';
import { GroundingSource } from '../types/research';

interface EpistemicBannerProps {
  analysis: VerificationAnalysis;
  groundingSources?: GroundingSource[];
}

export const EpistemicBanner: React.FC<EpistemicBannerProps> = ({
  analysis,
  groundingSources = [],
}) => {
  const {
    citationNeededCount,
    extractedFactsCount,
    verifiedGroundingCount,
    inferenceCount,
  } = analysis;

  const totalBadges = extractedFactsCount + verifiedGroundingCount + inferenceCount;

  return (
    <div className="mb-4 p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 font-medium text-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Epistemic Integrity &amp; Verification Audit</span>
        </div>
        {citationNeededCount > 0 ? (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/50 font-semibold animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            {citationNeededCount} Unverified Claim{citationNeededCount > 1 ? 's' : ''} Flagged
          </span>
        ) : (
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span>Zero Hallucinated Citations</span>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5" title="Direct facts extracted from context papers">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Context Facts:</span>
          <span className="font-semibold text-emerald-300">{extractedFactsCount}</span>
        </div>

        <div className="flex items-center gap-1.5" title="Verified external grounding sources">
          <Search className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-400">Verified Literature:</span>
          <span className="font-semibold text-sky-300">{verifiedGroundingCount}</span>
        </div>

        <div className="flex items-center gap-1.5" title="Analytical inference and mathematical proofs">
          <Lightbulb className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-slate-400">PI Inferences:</span>
          <span className="font-semibold text-purple-300">{inferenceCount}</span>
        </div>

        {totalBadges === 0 && citationNeededCount === 0 && (
          <span className="text-slate-500 italic">Epistemic tag analysis active</span>
        )}
      </div>

      {groundingSources && groundingSources.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/60">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Google Search Grounded Sources:
          </span>
          <div className="flex flex-wrap gap-2">
            {groundingSources.map((source, idx) => (
              <a
                key={idx}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-sky-200 text-[11px] transition-colors border border-slate-700"
              >
                <span className="truncate max-w-[200px]">{source.title}</span>
                <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
