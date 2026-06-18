import type { TimelineEvent } from '@/types';
import { STAGE_NAMES } from '@/types';
import { cn } from '@/lib/utils';

interface TimelineProps {
  events: TimelineEvent[];
  title?: string;
  className?: string;
}

const stageColor: Record<string, string> = {
  found: 'bg-[#1B9AAA]',
  analyze: 'bg-[#1B3F74]',
  contact: 'bg-[#FF6B35]',
  respond: 'bg-[#E9B44C]',
  verify: 'bg-[#2A5A9E]',
  closed: 'bg-emerald-500',
};

export default function Timeline({ events, title, className }: TimelineProps) {
  const sorted = [...events].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className={cn('bg-white rounded-2xl p-5 shadow-card', className)}>
      {title && (
        <h3 className="text-base font-bold text-deepsea-900 mb-5">{title}</h3>
      )}
      <div className="relative pl-6">
        <div className="absolute left-[11px] top-1 bottom-1 w-0.5 bg-gradient-to-b from-deepsea-200 via-deepsea-100 to-transparent" />
        <ul className="space-y-5">
          {sorted.map((ev, idx) => (
            <li key={ev.id} className="relative animate-slide-up-in" style={{ animationDelay: `${idx * 60}ms` }}>
              <span
                className={cn(
                  'absolute -left-[22px] top-1 w-6 h-6 rounded-full border-4 border-white shadow-md',
                  stageColor[ev.stage]
                )}
              />
              <div className="bg-deepsea-50/60 rounded-xl p-4 border border-deepsea-100/60 hover:bg-deepsea-50 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center text-sm font-bold text-deepsea-900">
                      {ev.title}
                    </span>
                    <span className="chip bg-white text-deepsea-600 border border-deepsea-100 shadow-sm">
                      {STAGE_NAMES[ev.stage]}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">{ev.time}</span>
                </div>
                <p className="text-sm text-deepsea-700 leading-relaxed mb-2">{ev.detail}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <span className="inline-block w-4 h-4 rounded-full bg-deepsea-100 text-deepsea-600 text-[9px] font-bold leading-4 text-center">
                    {ev.operator.charAt(0)}
                  </span>
                  {ev.operator}
                </p>
              </div>
            </li>
          ))}
          {events.length === 0 && (
            <li className="text-center text-sm text-slate-400 py-8">暂无时间线记录</li>
          )}
        </ul>
      </div>
    </div>
  );
}
