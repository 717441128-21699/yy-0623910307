import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  AlertTriangle,
  AlertOctagon,
  LayoutGrid,
  Search,
  ChevronDown,
  Clock,
  Inbox,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as PieTooltip,
  Legend as PieLegend,
} from 'recharts';
import { useClueStore } from '@/store/clueStore';
import StatCard from '@/components/StatCard';
import ClueCard from '@/components/ClueCard';
import TrendChart from '@/components/TrendChart';
import { PLATFORM_NAMES, type RiskLevel, type PlatformType } from '@/types';
import { cn } from '@/lib/utils';

const riskFilters: { key: 'all' | RiskLevel; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'watch', label: '关注' },
  { key: 'warn', label: '预警' },
  { key: 'escalate', label: '升级' },
];

const timeFilters: { key: '1h' | '6h' | '24h'; label: string }[] = [
  { key: '1h', label: '最近1小时' },
  { key: '6h', label: '最近6小时' },
  { key: '24h', label: '最近24小时' },
];

const platformOptions: { key: string; label: string }[] = [
  { key: 'all', label: '全部平台' },
  { key: 'weibo', label: '微博' },
  { key: 'wechat', label: '微信' },
  { key: 'douyin', label: '抖音' },
  { key: 'tieba', label: '百度贴吧' },
  { key: 'zhihu', label: '知乎' },
  { key: 'news', label: '新闻门户' },
];

const PIE_COLORS: Record<PlatformType, string> = {
  weibo: '#E63946',
  wechat: '#07C160',
  douyin: '#1F1F1F',
  tieba: '#3B82F6',
  zhihu: '#0084FF',
  news: '#7C3AED',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    clues,
    stats,
    loading,
    filterRisk,
    filterPlatform,
    filterKeyword,
    filterTimeRange,
    fetchClues,
    fetchStats,
    setFilterRisk,
    setFilterPlatform,
    setFilterKeyword,
    setFilterTimeRange,
    getFilteredClues,
  } = useClueStore();

  useEffect(() => {
    fetchClues();
    fetchStats();
  }, [fetchClues, fetchStats]);

  const filteredClues = useMemo(() => getFilteredClues(), [clues, filterRisk, filterPlatform, filterKeyword, getFilteredClues]);

  return (
    <div className="space-y-6 animate-slide-up-in">
      <section className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-deepsea-900 tracking-tight flex items-center gap-3">
            <span className="inline-block w-1.5 h-8 rounded-full bg-gradient-to-b from-deepsea-500 to-[#1B9AAA]" />
            舆情态势总览
          </h1>
          <p className="text-deepsea-600 mt-1.5 ml-4.5 text-sm">
            实时监控敏感话题传播态势，当前时间：{new Date().toLocaleString('zh-CN')}
          </p>
        </div>
        {loading && (
          <span className="inline-flex items-center gap-2 text-xs text-deepsea-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#1B9AAA] animate-pulse" />
            数据同步中...
          </span>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="关注数"
          value={stats?.watchCount ?? 0}
          icon={<Eye size={22} />}
          iconBg="bg-[#1B9AAA]/10"
          iconColor="text-[#1B9AAA]"
          trend={12}
          trendLabel="较昨日同期"
        />
        <StatCard
          title="预警数"
          value={stats?.warnCount ?? 0}
          icon={<AlertTriangle size={22} />}
          iconBg="bg-[#FF6B35]/10"
          iconColor="text-[#FF6B35]"
          trend={-5}
          trendLabel="较昨日同期"
        />
        <StatCard
          title="升级数"
          value={stats?.escalateCount ?? 0}
          icon={<AlertOctagon size={22} />}
          iconBg="bg-[#D72638]/10"
          iconColor="text-[#D72638]"
          trend={28}
          trendLabel="需重点处置"
          highlight="red"
        />
        <StatCard
          title="线索总数"
          value={stats?.totalCount ?? 0}
          icon={<LayoutGrid size={22} />}
          iconBg="bg-[#E9B44C]/15"
          iconColor="text-[#b8862d]"
          trend={8}
          trendLabel="24小时累计"
        />
      </section>

      <section className="bg-white rounded-2xl p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-deepsea-50 rounded-xl p-1">
            {riskFilters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilterRisk(f.key)}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200',
                  filterRisk === f.key
                    ? f.key === 'escalate'
                      ? 'bg-[#D72638] text-white shadow-md'
                      : f.key === 'warn'
                      ? 'bg-[#FF6B35] text-white shadow-md'
                      : f.key === 'watch'
                      ? 'bg-[#1B9AAA] text-white shadow-md'
                      : 'bg-deepsea-600 text-white shadow-md'
                    : 'text-deepsea-700 hover:bg-white'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              value={filterPlatform}
              onChange={e => setFilterPlatform(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2 rounded-xl border border-deepsea-100 bg-white text-sm text-deepsea-800 font-medium focus:outline-none focus:ring-4 focus:ring-deepsea-100 focus:border-deepsea-300 cursor-pointer"
            >
              {platformOptions.map(o => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-deepsea-500 pointer-events-none" />
          </div>

          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-deepsea-400" />
            <input
              type="text"
              value={filterKeyword}
              onChange={e => setFilterKeyword(e.target.value)}
              placeholder="搜索关键词、标题..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-deepsea-100 bg-white text-sm text-deepsea-900 placeholder:text-deepsea-400 focus:outline-none focus:ring-4 focus:ring-deepsea-100 focus:border-deepsea-300 transition-all"
            />
          </div>

          <div className="flex items-center gap-1 bg-deepsea-50 rounded-xl p-1">
            {timeFilters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilterTimeRange(f.key)}
                className={cn(
                  'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                  filterTimeRange === f.key
                    ? 'bg-white text-deepsea-700 shadow-sm'
                    : 'text-deepsea-500 hover:text-deepsea-700'
                )}
              >
                <Clock size={12} />
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          {stats?.trend24h && (
            <TrendChart data={stats.trend24h} title="24小时舆情传播趋势" height={320} />
          )}
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h3 className="text-base font-bold text-deepsea-900 mb-4">平台来源分布</h3>
          {stats?.platformDist && (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.platformDist.map(p => ({
                    name: PLATFORM_NAMES[p.platform],
                    value: p.value,
                    key: p.platform,
                  }))}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stats.platformDist.map((p, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[p.platform]} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <PieTooltip
                  contentStyle={{
                    background: 'rgba(11, 32, 56, 0.95)',
                    border: 'none',
                    borderRadius: 12,
                    color: '#fff',
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string) => [`${value} 条`, name]}
                />
                <PieLegend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingTop: 0 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-deepsea-900 flex items-center gap-2">
              热点线索池
              <span className="chip bg-[#1B9AAA]/10 text-[#1B9AAA] border border-[#1B9AAA]/20">
                {filteredClues.length} 条
              </span>
            </h2>
            <p className="text-sm text-slate-500 mt-1 ml-0.5">按时间滚动展示，点击卡片查看详情</p>
          </div>
        </div>

        {filteredClues.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 shadow-card text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-deepsea-50 text-deepsea-400 mb-4">
              <Inbox size={32} />
            </div>
            <h3 className="text-lg font-bold text-deepsea-800 mb-2">暂无符合条件的线索</h3>
            <p className="text-sm text-slate-500">请尝试调整筛选条件或关键词搜索</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredClues.map((clue, idx) => (
              <ClueCard
                key={clue.id}
                clue={clue}
                onClick={() => navigate(`/clue/${clue.id}`)}
                style={{ animationDelay: `${idx * 60}ms` } as React.CSSProperties}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
