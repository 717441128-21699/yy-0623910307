import type { CSSProperties } from 'react';
import type { Clue } from '@/types';
import RiskBadge from './RiskBadge';
import EmotionIcon from './EmotionIcon';
import PlatformLogo from './PlatformLogo';
import { cn } from '@/lib/utils';
import { Zap, Clock, Layers, ChevronRight, AlertCircle } from 'lucide-react';
import { REASON_NAMES, RISK_NAMES } from '@/types';

interface ClueCardProps {
  clue: Clue;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  index?: number;
}

const riskBorder: Record<string, string> = {
  watch: 'hover:border-[#1B9AAA]/40',
  warn: 'hover:border-[#FF6B35]/40',
  escalate: 'hover:border-[#D72638]/40 shadow-[inset_0_2px_0_0_rgba(215,38,56,0.08)]',
};

export default function ClueCard({ clue, onClick, className, style, index }: ClueCardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(
        'group bg-white rounded-2xl p-5 shadow-card border border-transparent transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer animate-slide-up-in',
        riskBorder[clue.riskLevel],
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <PlatformLogo platform={clue.platform} size={28} />
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-medium">
              {clue.author}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock size={11} />
              {clue.timeAgo}
            </span>
          </div>
        </div>
        <RiskBadge level={clue.riskLevel} size="sm" />
      </div>

      <h3 className="text-base font-bold text-deepsea-900 mb-2 line-clamp-2 leading-snug group-hover:text-deepsea-700 transition-colors">
        {clue.title}
      </h3>

      <p className="text-sm text-deepsea-700 leading-relaxed mb-4 line-clamp-2">
        {clue.summary}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {clue.keywords.slice(0, 4).map((k) => (
          <span
            key={k}
            className="chip bg-deepsea-50 text-deepsea-600 border border-deepsea-100"
          >
            #{k}
          </span>
        ))}
        {clue.keywords.length > 4 && (
          <span className="chip bg-slate-50 text-slate-500 border border-slate-100">
            +{clue.keywords.length - 4}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-4 text-xs text-deepsea-700">
          <span className="inline-flex items-center gap-1 font-semibold">
            <Zap size={13} className={cn(
              clue.forwardSpeed > 200 ? 'text-[#D72638]' :
              clue.forwardSpeed > 80 ? 'text-[#FF6B35]' : 'text-deepsea-500'
            )} />
            {clue.forwardSpeed}/h
          </span>
          <span className="inline-flex items-center gap-1">
            <EmotionIcon type={clue.emotion} size={13} />
          </span>
          <span className="inline-flex items-center gap-1 text-slate-500">
            <Layers size={13} />
            {clue.similarCount}
          </span>
        </div>
        <span className="inline-flex items-center gap-0.5 text-xs text-deepsea-600 font-medium group-hover:text-deepsea-800 transition-colors">
          查看详情
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>

      {clue.adjustHistory && clue.adjustHistory.length > 0 && (
        <div className="mt-3 pt-3 border-t border-deepsea-100/70">
          <div className="flex items-start gap-2">
            <AlertCircle size={13} className="text-[#FF6B35] mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-slate-500 mb-0.5">
                最近研判：<span className="font-semibold text-slate-600">{RISK_NAMES[clue.adjustHistory[clue.adjustHistory.length - 1].toLevel]}</span>
                <span className="mx-1 text-slate-300">·</span>
                <span className="text-deepsea-700">{REASON_NAMES[clue.adjustHistory[clue.adjustHistory.length - 1].reason] || clue.adjustHistory[clue.adjustHistory.length - 1].reason}</span>
              </div>
              {clue.adjustHistory[clue.adjustHistory.length - 1].judgment && (
                <p className="text-[11px] leading-relaxed text-slate-600 line-clamp-2">
                  {clue.adjustHistory[clue.adjustHistory.length - 1].judgment}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
