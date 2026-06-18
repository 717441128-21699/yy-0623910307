import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  Home,
  Sparkles,
  ChevronDown,
  ExternalLink,
  Eye,
  AlertTriangle,
  AlertOctagon,
  Play,
  BookmarkPlus,
  Ban,
  ArrowRight,
  Clock,
  User,
  CheckCircle2,
} from 'lucide-react';
import { useClueStore } from '@/store/clueStore';
import RiskBadge from '@/components/RiskBadge';
import EmotionIcon from '@/components/EmotionIcon';
import PlatformLogo from '@/components/PlatformLogo';
import TrendChart from '@/components/TrendChart';
import SpreadGraph from '@/components/SpreadGraph';
import { REASON_NAMES, RISK_NAMES, type RiskLevel } from '@/types';
import { cn } from '@/lib/utils';

export default function ClueDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { getClueById, adjustRiskLevel } = useClueStore();

  const [originalOpen, setOriginalOpen] = useState(false);
  const [targetLevel, setTargetLevel] = useState<RiskLevel | ''>('');
  const [reason, setReason] = useState('');
  const [remark, setRemark] = useState('');
  const [adjustSuccess, setAdjustSuccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const clue = useMemo(() => getClueById(id), [id, getClueById, refreshKey]);

  useEffect(() => {
    if (clue) {
      setTargetLevel(clue.riskLevel);
    }
  }, [clue?.id, clue?.riskLevel]);

  if (!clue) {
    return (
      <div className="text-center py-20 animate-slide-up-in">
        <h2 className="text-xl font-bold text-deepsea-800 mb-2">线索不存在</h2>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1 text-sm text-deepsea-600 hover:text-deepsea-800 font-medium"
        >
          <Home size={14} />
          返回首页
        </button>
      </div>
    );
  }

  const handleAdjust = () => {
    if (!targetLevel || !reason) {
      alert('请选择调整目标等级和原因');
      return;
    }
    adjustRiskLevel(clue.id, targetLevel, reason, remark);
    setRemark('');
    setReason('');
    setAdjustSuccess(true);
    setRefreshKey(k => k + 1);
    setTimeout(() => setAdjustSuccess(false), 2500);
  };

  const levelBtns: { level: RiskLevel; icon: typeof Eye; label: string; cls: string }[] = [
    { level: 'watch', icon: Eye, label: '关注', cls: 'hover:border-[#1B9AAA] hover:bg-[#1B9AAA]/5 data-[active=true]:bg-[#1B9AAA] data-[active=true]:text-white data-[active=true]:border-[#1B9AAA]' },
    { level: 'warn', icon: AlertTriangle, label: '预警', cls: 'hover:border-[#FF6B35] hover:bg-[#FF6B35]/5 data-[active=true]:bg-[#FF6B35] data-[active=true]:text-white data-[active=true]:border-[#FF6B35]' },
    { level: 'escalate', icon: AlertOctagon, label: '升级', cls: 'hover:border-[#D72638] hover:bg-[#D72638]/5 data-[active=true]:bg-[#D72638] data-[active=true]:text-white data-[active=true]:border-[#D72638]' },
  ];

  return (
    <div className="space-y-6 animate-slide-up-in">
      <nav className="inline-flex items-center gap-1.5 text-sm text-deepsea-600 bg-white/60 backdrop-blur rounded-xl px-4 py-2 shadow-sm border border-deepsea-100/50">
        <Link to="/" className="inline-flex items-center gap-1 hover:text-deepsea-900 font-medium transition-colors">
          <Home size={14} />
          首页
        </Link>
        <ChevronRight size={14} className="text-deepsea-300" />
        <span className="text-deepsea-500">线索详情</span>
        <ChevronRight size={14} className="text-deepsea-300" />
        <span className="text-deepsea-800 font-semibold max-w-[280px] truncate">{clue.title}</span>
      </nav>

      <section className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          <div className="lg:col-span-2 p-6 lg:p-7 border-b lg:border-b-0 lg:border-r border-deepsea-50">
            <div className="flex items-start gap-3 flex-wrap mb-3">
              <RiskBadge level={clue.riskLevel} size="lg" />
              <div className="flex flex-wrap gap-1.5">
                {clue.keywords.map(k => (
                  <span key={k} className="chip bg-deepsea-50 text-deepsea-600 border border-deepsea-100">
                    #{k}
                  </span>
                ))}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-deepsea-900 leading-tight mb-4 text-balance">
              {clue.title}
            </h1>
            <div className="flex items-center flex-wrap gap-4 mb-6 text-sm text-deepsea-700">
              <span className="inline-flex items-center gap-2">
                <PlatformLogo platform={clue.platform} size={26} />
                <span className="font-semibold">{clue.author}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-500">
                <Clock size={14} />
                {clue.timeAgo} · {clue.publishedAt.slice(0, 16).replace('T', ' ')}
              </span>
              <span className="inline-flex items-center gap-1">
                <EmotionIcon type={clue.emotion} size={14} />
              </span>
              {clue.originalUrl && (
                <a
                  href={clue.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-deepsea-600 hover:text-deepsea-800 font-semibold"
                >
                  查看原文
                  <ExternalLink size={13} />
                </a>
              )}
            </div>

            <div className="bg-gradient-to-br from-[#1B9AAA]/8 via-white to-[#1B3F74]/5 rounded-2xl p-5 border border-[#1B9AAA]/10 mb-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#1B9AAA]/15 text-[#1B9AAA]">
                  <Sparkles size={16} />
                </span>
                <h3 className="text-sm font-bold text-deepsea-900">AI 智能摘要</h3>
                <span className="chip bg-white text-deepsea-500 border border-deepsea-100 text-[10px]">
                  由大模型生成，仅供参考
                </span>
              </div>
              <p className="text-sm text-deepsea-800 leading-relaxed">
                {clue.summary}
              </p>
            </div>

            {clue.originalContent && (
              <div className="border border-deepsea-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOriginalOpen(!originalOpen)}
                  className="w-full flex items-center justify-between px-5 py-3.5 bg-deepsea-50/50 hover:bg-deepsea-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-deepsea-800 flex items-center gap-2">
                    <User size={15} />
                    原文内容
                  </span>
                  <ChevronDown
                    size={18}
                    className={cn('text-deepsea-500 transition-transform', originalOpen && 'rotate-180')}
                  />
                </button>
                {originalOpen && (
                  <div className="p-5 text-sm text-deepsea-700 leading-relaxed whitespace-pre-wrap bg-white border-t border-deepsea-50">
                    {clue.originalContent}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6 lg:p-7 space-y-5">
            <div className="bg-gradient-to-br from-deepsea-50 via-white to-white rounded-2xl p-5 border border-deepsea-100">
              <h3 className="text-base font-bold text-deepsea-900 mb-4">风险等级调整</h3>
              <div className="mb-4 flex justify-center">
                <RiskBadge level={clue.riskLevel} size="lg" />
              </div>
              <p className="text-xs text-center text-slate-500 mb-5">
                当前等级：<span className="font-semibold text-deepsea-700">{RISK_NAMES[clue.riskLevel]}</span>
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {levelBtns.map(b => {
                  const Icon = b.icon;
                  const isActive = targetLevel === b.level;
                  const isCurrent = clue.riskLevel === b.level;
                  return (
                    <button
                      key={b.level}
                      data-active={isActive}
                      disabled={isCurrent && isActive}
                      onClick={() => setTargetLevel(b.level)}
                      className={cn(
                        'flex flex-col items-center justify-center gap-1 py-3 rounded-xl border border-deepsea-100 text-xs font-semibold transition-all duration-200',
                        b.cls,
                        isCurrent && isActive && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      <Icon size={16} />
                      {b.label}
                    </button>
                  );
                })}
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-deepsea-700 mb-1.5">调整原因</label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-deepsea-100 text-sm text-deepsea-800 focus:outline-none focus:ring-4 focus:ring-deepsea-100 focus:border-deepsea-300 bg-white"
                >
                  <option value="">请选择原因...</option>
                  {Object.entries(REASON_NAMES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-deepsea-700 mb-1.5">备注</label>
                <textarea
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  rows={2}
                  placeholder="可填写补充说明..."
                  className="w-full px-3 py-2.5 rounded-xl border border-deepsea-100 text-sm text-deepsea-800 placeholder:text-deepsea-300 focus:outline-none focus:ring-4 focus:ring-deepsea-100 focus:border-deepsea-300 resize-none"
                />
              </div>
              <button
                onClick={handleAdjust}
                className={cn(
                  'w-full py-3 rounded-xl text-sm font-bold shadow-lg transition-all duration-200 flex items-center justify-center gap-2',
                  adjustSuccess
                    ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-deepsea-700 via-deepsea-600 to-deepsea-500 text-white shadow-deepsea-600/25 hover:shadow-xl hover:shadow-deepsea-600/30 hover:-translate-y-0.5 active:translate-y-0'
                )}
              >
                {adjustSuccess ? (
                  <>
                    <CheckCircle2 size={16} />
                    调整成功，已保存
                  </>
                ) : (
                  '确认调整'
                )}
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-deepsea-900 px-1">快捷操作</h3>
              <button
                onClick={() => navigate(`/clue/${clue.id}/handle`)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white border border-deepsea-100 hover:border-deepsea-300 hover:bg-deepsea-50 text-sm font-semibold text-deepsea-800 transition-all group"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#1B9AAA]/10 text-[#1B9AAA] flex items-center justify-center">
                    <Play size={14} />
                  </span>
                  启动处置流程
                </span>
                <ArrowRight size={16} className="text-deepsea-400 group-hover:translate-x-1 group-hover:text-deepsea-600 transition-all" />
              </button>
              <button className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white border border-deepsea-100 hover:border-deepsea-300 hover:bg-deepsea-50 text-sm font-semibold text-deepsea-800 transition-all group">
                <span className="inline-flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#E9B44C]/15 text-[#b8862d] flex items-center justify-center">
                    <BookmarkPlus size={14} />
                  </span>
                  加入观察名单
                </span>
                <ArrowRight size={16} className="text-deepsea-400 group-hover:translate-x-1 group-hover:text-deepsea-600 transition-all" />
              </button>
              <button className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white border border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-sm font-semibold text-slate-600 transition-all group">
                <span className="inline-flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                    <Ban size={14} />
                  </span>
                  忽略此线索
                </span>
                <ArrowRight size={16} className="text-slate-300 group-hover:translate-x-1 group-hover:text-slate-500 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {clue.trendData && clue.trendData.length > 0 && (
          <TrendChart data={clue.trendData.slice(-12)} title="近6小时传播走势" />
        )}
        {clue.spreadNodes && clue.spreadNodes.length > 0 && (
          <SpreadGraph nodes={clue.spreadNodes} title="关键传播节点" />
        )}
      </section>

      {clue.adjustHistory && clue.adjustHistory.length > 0 && (
        <section className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-deepsea-50 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-deepsea-500 to-[#1B9AAA]" />
            <h3 className="text-base font-bold text-deepsea-900">风险等级调整历史</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-deepsea-50/50 text-deepsea-600">
                  <th className="text-left px-6 py-3 font-semibold">调整时间</th>
                  <th className="text-left px-6 py-3 font-semibold">调整前</th>
                  <th className="text-left px-6 py-3 font-semibold">调整后</th>
                  <th className="text-left px-6 py-3 font-semibold">调整原因</th>
                  <th className="text-left px-6 py-3 font-semibold">备注</th>
                  <th className="text-left px-6 py-3 font-semibold">操作人</th>
                </tr>
              </thead>
              <tbody>
                {clue.adjustHistory.map(r => (
                  <tr key={r.id} className="border-t border-deepsea-50 hover:bg-deepsea-50/30 transition-colors">
                    <td className="px-6 py-3.5 text-slate-600 font-mono text-xs">{r.time}</td>
                    <td className="px-6 py-3.5"><RiskBadge level={r.fromLevel} size="sm" showIcon={false} /></td>
                    <td className="px-6 py-3.5"><RiskBadge level={r.toLevel} size="sm" showIcon={false} /></td>
                    <td className="px-6 py-3.5 text-deepsea-700 font-medium">{REASON_NAMES[r.reason] || r.reason}</td>
                    <td className="px-6 py-3.5 text-slate-600 max-w-[240px] truncate">{r.remark || '-'}</td>
                    <td className="px-6 py-3.5 text-deepsea-700">{r.operator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
