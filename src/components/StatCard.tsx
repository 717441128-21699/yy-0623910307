import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: number;
  trendLabel?: string;
  highlight?: 'red' | 'none';
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  trend,
  trendLabel,
  highlight = 'none',
  className,
}: StatCardProps) {
  const TrendIcon =
    trend !== undefined && trend > 0 ? TrendingUp : trend !== undefined && trend < 0 ? TrendingDown : Minus;
  const trendColor =
    trend !== undefined && trend > 0
      ? 'text-rose-500'
      : trend !== undefined && trend < 0
      ? 'text-emerald-500'
      : 'text-slate-400';

  return (
    <div
      className={cn(
        'relative bg-white rounded-2xl p-5 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 overflow-hidden',
        highlight === 'red' && 'shadow-[0_4px_14px_-2px_rgba(215,38,56,0.12),inset_0_2px_0_0_rgba(215,38,56,0.15)]',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-deepsea-600 font-medium mb-1.5">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-deepsea-900 tracking-tight">{value}</span>
            {trend !== undefined && (
              <span className={cn('inline-flex items-center gap-0.5 text-xs font-semibold', trendColor)}>
                <TrendIcon size={12} />
                {Math.abs(trend)}%
              </span>
            )}
          </div>
          {trendLabel && <p className="text-xs text-slate-500 mt-1.5">{trendLabel}</p>}
        </div>
        <div
          className={cn(
            'flex items-center justify-center rounded-xl shrink-0',
            iconBg,
            iconColor,
            'w-12 h-12 shadow-inner'
          )}
        >
          {icon}
        </div>
      </div>
      <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full opacity-5 blur-2xl bg-deepsea-500" />
    </div>
  );
}
