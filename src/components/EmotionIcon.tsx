import { Smile, Meh, Frown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EmotionType } from '@/types';

interface EmotionIconProps {
  type?: EmotionType;
  emotion?: EmotionType;
  size?: number;
  className?: string;
}

const styleMap: Record<EmotionType, { cls: string; label: string }> = {
  positive: { cls: 'text-emerald-500', label: '正面' },
  neutral: { cls: 'text-slate-500', label: '中性' },
  negative: { cls: 'text-rose-500', label: '负面' },
};

const IconMap = {
  positive: Smile,
  neutral: Meh,
  negative: Frown,
};

export default function EmotionIcon({ type, emotion, size = 16, className }: EmotionIconProps) {
  const e = emotion ?? type ?? 'neutral';
  const Icon = IconMap[e];
  const { cls } = styleMap[e];
  return <Icon size={size} className={cn(cls, className)} />;
}
