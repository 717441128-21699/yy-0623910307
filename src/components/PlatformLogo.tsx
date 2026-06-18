import { cn } from '@/lib/utils';
import type { PlatformType } from '@/types';
import { PLATFORM_NAMES } from '@/types';

interface PlatformLogoProps {
  platform: PlatformType;
  size?: number;
  showName?: boolean;
  className?: string;
}

const platformStyle: Record<PlatformType, { bg: string; text: string; abbr: string }> = {
  weibo: { bg: 'bg-gradient-to-br from-red-500 to-orange-500', text: 'text-white', abbr: 'WB' },
  wechat: { bg: 'bg-gradient-to-br from-green-500 to-emerald-600', text: 'text-white', abbr: 'WX' },
  douyin: { bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900', text: 'text-white', abbr: 'DY' },
  tieba: { bg: 'bg-gradient-to-br from-blue-500 to-blue-700', text: 'text-white', abbr: 'TB' },
  zhihu: { bg: 'bg-gradient-to-br from-sky-600 to-blue-700', text: 'text-white', abbr: 'ZH' },
  news: { bg: 'bg-gradient-to-br from-purple-600 to-indigo-700', text: 'text-white', abbr: 'NW' },
};

export default function PlatformLogo({ platform, size = 32, showName = false, className }: PlatformLogoProps) {
  const style = platformStyle[platform];

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-bold shadow-sm',
          style.bg, style.text
        )}
        style={{ width: size, height: size, fontSize: size * 0.35 }}
      >
        {style.abbr}
      </span>
      {showName && <span className="text-sm text-deepsea-700 font-medium">{PLATFORM_NAMES[platform]}</span>}
    </span>
  );
}
