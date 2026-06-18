import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/types';
import { RISK_NAMES } from '@/types';
import { Eye, AlertTriangle, AlertOctagon } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { px: 'px-2', py: 'py-0.5', text: 'text-xs', icon: 12, gap: 'gap-1' },
  md: { px: 'px-3', py: 'py-1', text: 'text-sm', icon: 14, gap: 'gap-1.5' },
  lg: { px: 'px-4', py: 'py-1.5', text: 'text-base', icon: 18, gap: 'gap-2' },
};

const colorMap: Record<RiskLevel, { bg: string; text: string; border: string; dot: string }> = {
  watch: {
    bg: 'bg-[#1B9AAA]/10',
    text: 'text-[#1B9AAA]',
    border: 'border border-[#1B9AAA]/30',
    dot: 'bg-[#1B9AAA]',
  },
  warn: {
    bg: 'bg-[#FF6B35]/10',
    text: 'text-[#FF6B35]',
    border: 'border border-[#FF6B35]/30',
    dot: 'bg-[#FF6B35]',
  },
  escalate: {
    bg: 'bg-[#D72638]/10',
    text: 'text-[#D72638]',
    border: 'border border-[#D72638]/30',
    dot: 'bg-[#D72638]',
  },
};

const IconMap = {
  watch: Eye,
  warn: AlertTriangle,
  escalate: AlertOctagon,
};

export default function RiskBadge({ level, size = 'md', showIcon = true, className }: RiskBadgeProps) {
  const s = sizeMap[size];
  const c = colorMap[level];
  const Icon = IconMap[level];

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-md backdrop-blur-sm',
        s.px, s.py, s.text, s.gap,
        c.bg, c.text, c.border,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', c.dot, size !== 'sm' && 'animate-pulse')} />
      {showIcon && <Icon size={s.icon} className="shrink-0" />}
      {RISK_NAMES[level]}
    </span>
  );
}
