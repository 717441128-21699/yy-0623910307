import type { SpreadNode } from '@/types';
import { PLATFORM_NAMES } from '@/types';
import { cn } from '@/lib/utils';
import { Star, Users, Repeat2 } from 'lucide-react';
import PlatformLogo from './PlatformLogo';

interface SpreadGraphProps {
  nodes: SpreadNode[];
  title?: string;
  className?: string;
}

function formatFollowers(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return n.toString();
}

export default function SpreadGraph({ nodes, title, className }: SpreadGraphProps) {
  const byLevel: Record<number, SpreadNode[]> = {};
  nodes.forEach(n => {
    if (!byLevel[n.level]) byLevel[n.level] = [];
    byLevel[n.level].push(n);
  });
  const levels = Object.keys(byLevel).map(Number).sort();
  const levelLabels = ['源头', '一级节点', '二级节点', '三级节点'];

  return (
    <div className={cn('bg-white rounded-2xl p-5 shadow-card', className)}>
      {title && (
        <h3 className="text-base font-bold text-deepsea-900 mb-4">{title}</h3>
      )}
      <div className="space-y-5">
        {levels.map((lv, li) => (
          <div key={lv} className="relative">
            <div className="flex items-center gap-3 mb-2.5">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-deepsea-50 text-deepsea-700 text-xs font-bold">
                {lv + 1}
              </span>
              <span className="text-sm font-semibold text-deepsea-800">
                {levelLabels[lv] || `第${lv + 1}层级`}
              </span>
              <span className="text-xs text-slate-400">· 共 {byLevel[lv].length} 个传播节点</span>
              {li < levels.length - 1 && (
                <div className="flex-1 h-px bg-gradient-to-r from-deepsea-100 via-deepsea-200 to-transparent ml-2" />
              )}
            </div>
            <div className="pl-11 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {byLevel[lv].map(node => (
                <div
                  key={node.id}
                  className={cn(
                    'group relative rounded-xl p-3 border transition-all duration-200',
                    node.isKey
                      ? 'bg-gradient-to-br from-deepsea-50 via-white to-white border-deepsea-200 hover:border-deepsea-400'
                      : 'bg-slate-50/50 border-slate-100 hover:border-deepsea-200 hover:bg-white'
                  )}
                >
                  {node.isKey && (
                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#E9B44C] text-white shadow-md">
                      <Star size={12} fill="currentColor" />
                    </span>
                  )}
                  <div className="flex items-start gap-2.5">
                    <PlatformLogo platform={node.platform} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          'text-sm font-bold truncate',
                          node.isKey ? 'text-deepsea-900' : 'text-deepsea-800'
                        )}>
                          {node.username}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {PLATFORM_NAMES[node.platform]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-deepsea-600">
                        <span className="inline-flex items-center gap-1">
                          <Users size={11} />
                          {formatFollowers(node.followers)}
                        </span>
                        <span className={cn(
                          'inline-flex items-center gap-1 font-semibold',
                          node.forwards > 1000 ? 'text-[#D72638]' : node.forwards > 100 ? 'text-[#FF6B35]' : ''
                        )}>
                          <Repeat2 size={11} />
                          {node.forwards.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
