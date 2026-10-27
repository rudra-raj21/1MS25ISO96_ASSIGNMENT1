import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface FollowUpActionsProps {
  actions: string[];
  onSelectAction: (actionText: string) => void;
  isLoading?: boolean;
}

export const FollowUpActions: React.FC<FollowUpActionsProps> = ({
  actions,
  onSelectAction,
  isLoading = false,
}) => {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="mt-6 pt-4 border-t border-slate-800">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          High-Leverage PI Follow-Up Actions
        </h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {actions.map((action, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => onSelectAction(action)}
            className="group flex items-start gap-2.5 p-3 text-left rounded-lg bg-slate-900/90 hover:bg-slate-850 border border-slate-700/80 hover:border-indigo-500/60 transition-all text-xs text-slate-300 hover:text-white cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-700/50 text-[10px] font-bold shrink-0 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              {idx + 1}
            </span>
            <span className="flex-1 leading-snug line-clamp-3">{action}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
};
