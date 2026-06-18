import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Users,
  ShieldAlert,
  Clock,
  FileText,
  CheckCircle2,
  TrendingUp,
  AlertOctagon,
  Eye,
  AlertTriangle,
  ChevronRight,
  Home,
  PenLine,
  Save,
  History,
} from 'lucide-react';
import * as api from '@/mock/api';
import type { HandoverRecord, OpenClue, RiskLevel } from '@/types';
import { RISK_NAMES, STAGE_NAMES } from '@/types';
import { cn } from '@/lib/utils';
import StatCard from '@/components/StatCard';

export default function HandoverPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HandoverRecord[]>([]);
  const [openClues, setOpenClues] = useState<OpenClue[]>([]);
  const [shiftStarter, setShiftStarter] = useState('');
  const [shiftEnder, setShiftEnder] = useState('');
  const [remark, setRemark] = useState('');
  const [nowTime, setNowTime] = useState(new Date());

  useEffect(() => {
    api.getRecentHandovers(3).then(setHistory);
    Promise.resolve(api.MOCK_OPEN_CLUES).then(setOpenClues);
    const t = setInterval(() => setNowTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const shiftStats = history[0] ?? { foundCount: 0, handledCount: 0, escalateCount: 0, avgResponseTime: 0 };

  const riskColorBar: Record<RiskLevel, string> = {
    watch: 'bg-[#1B9AAA]',
    warn: 'bg-[#FF6B35]',
    escalate: 'bg-[#D72638]',
  };

  const riskBadgeClass: Record<RiskLevel, string> = {
    watch: 'bg-[#1B9AAA]/10 text-[#1B9AAA] border-[#1B9AAA]/20',
    warn: 'bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20',
    escalate: 'bg-[#D72638]/10 text-[#D72638] border-[#D72638]/20',
  };

  const handleConfirmHandover = () => {
    if (!shiftStarter.trim() || !shiftEnder.trim()) {
      alert('请填写交班人和接班人签名');
      return;
    }
    alert(`交接班确认成功！\n交班人：${shiftStarter}\n接班人：${shiftEnder}\n时间：${new Date().toLocaleString('zh-CN')}`);
    setShiftStarter('');
    setShiftEnder('');
    setRemark('');
  };

  return (
    <div className="space-y-6 animate-slide-up-in">
      <section className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B9AAA] bg-[#1B9AAA]/8 px-3 py-1 rounded-full mb-3">
            <ShieldAlert size={12} />
            值班管理系统
          </div>
          <h1 className="text-3xl font-bold text-deepsea-900 tracking-tight flex items-center gap-3">
            <span className="inline-block w-1.5 h-8 rounded-full bg-gradient-to-b from-[#E9B44C] to-[#b8862d]" />
            交接班汇总
          </h1>
          <p className="text-deepsea-600 mt-1.5 ml-4.5 text-sm">
            <Clock size={13} className="inline mr-1 -mt-0.5" />
            当前时间：{nowTime.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-deepsea-200 text-deepsea-700 text-sm font-medium hover:bg-deepsea-50 transition"
        >
          <ArrowLeft size={15} />
          返回首页
        </Link>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="本班发现线索"
          value={shiftStats.foundCount}
          icon={<Eye size={22} />}
          iconBg="bg-[#1B9AAA]/10"
          iconColor="text-[#1B9AAA]"
          trend={8}
          trendLabel="较上一班次"
        />
        <StatCard
          title="处置完成数"
          value={shiftStats.handledCount}
          icon={<CheckCircle2 size={22} />}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-600"
          trend={12}
          trendLabel="较上一班次"
        />
        <StatCard
          title="升级线索"
          value={shiftStats.escalateCount}
          icon={<AlertOctagon size={22} />}
          iconBg="bg-[#D72638]/10"
          iconColor="text-[#D72638]"
          trend={0}
          trendLabel="需重点跟进"
          highlight="red"
        />
        <StatCard
          title="平均响应时长"
          value={`${shiftStats.avgResponseTime} 分`}
          icon={<Clock size={22} />}
          iconBg="bg-[#E9B44C]/15"
          iconColor="text-[#b8862d]"
          trend={-5}
          trendLabel="较上一班次"
        />
      </section>

      <section className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-deepsea-50 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-deepsea-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#FF6B35]" />
              未闭环线索清单
              <span className="chip bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20">
                {openClues.length} 条待跟进
              </span>
            </h2>
            <p className="text-xs text-deepsea-500 mt-1 ml-7">
              请接班同志重点跟进以下未处置完成的线索
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-deepsea-50/70 text-deepsea-700">
                <th className="text-left font-semibold px-6 py-3 w-1.5"></th>
                <th className="text-left font-semibold px-3 py-3">风险</th>
                <th className="text-left font-semibold px-3 py-3">关键词</th>
                <th className="text-left font-semibold px-3 py-3">首次发现</th>
                <th className="text-left font-semibold px-3 py-3">当前阶段</th>
                <th className="text-left font-semibold px-3 py-3">待办事项</th>
                <th className="text-right font-semibold px-6 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {openClues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-deepsea-400">
                    🎉 太棒了！当前没有未闭环的线索
                  </td>
                </tr>
              ) : (
                openClues.map((clue, idx) => (
                  <tr
                    key={clue.id}
                    className={cn(
                      'border-t border-deepsea-50 transition-colors group cursor-pointer hover:bg-deepsea-50/40',
                      idx % 2 === 1 ? 'bg-slate-50/50' : '',
                      clue.riskLevel === 'escalate' ? 'bg-[#D72638]/[0.04]' : ''
                    )}
                    onClick={() => navigate(`/clue/${clue.id}`)}
                  >
                    <td className="w-1.5 px-0 py-0">
                      <div className={cn('w-1 h-full min-h-[72px]', riskColorBar[clue.riskLevel])} />
                    </td>
                    <td className="px-3 py-4">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold',
                        riskBadgeClass[clue.riskLevel]
                      )}>
                        {clue.riskLevel === 'escalate' && <AlertOctagon size={11} />}
                        {clue.riskLevel === 'warn' && <AlertTriangle size={11} />}
                        {clue.riskLevel === 'watch' && <Eye size={11} />}
                        {RISK_NAMES[clue.riskLevel]}
                      </span>
                    </td>
                    <td className="px-3 py-4 min-w-[200px]">
                      <div className="flex flex-wrap gap-1.5">
                        {clue.keywords.map(k => (
                          <span
                            key={k}
                            className="chip bg-deepsea-50 text-deepsea-700 border border-deepsea-100 text-xs"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-deepsea-700 whitespace-nowrap">
                      <div className="font-medium">{clue.timeAgo}</div>
                      <div className="text-[11px] text-deepsea-400 mt-0.5">
                        {new Date(clue.foundAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-deepsea-100/60 text-deepsea-800 text-xs font-semibold">
                        {STAGE_NAMES[clue.stage]}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-deepsea-700 max-w-[320px]">
                      <p className="line-clamp-2 text-xs leading-relaxed">{clue.todo}</p>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/clue/${clue.id}`); }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-deepsea-600 hover:text-deepsea-900 hover:bg-deepsea-50 transition group-hover:bg-deepsea-100/70"
                      >
                        查看详情
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-card p-6 lg:p-7">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-deepsea-600 to-deepsea-800 flex items-center justify-center">
              <PenLine size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-deepsea-900">交接班签字确认</h2>
              <p className="text-xs text-deepsea-500 mt-0.5">请确认本值班次所有事项已交接完毕</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-semibold text-deepsea-800 mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <Users size={13} className="text-deepsea-500" />
                  交班人签名
                </span>
              </label>
              <input
                type="text"
                value={shiftStarter}
                onChange={e => setShiftStarter(e.target.value)}
                placeholder="请输入交班人姓名"
                className="w-full px-4 py-3 rounded-xl border border-deepsea-100 bg-deepsea-50/40 text-sm text-deepsea-900 placeholder:text-deepsea-400 focus:outline-none focus:ring-4 focus:ring-deepsea-100 focus:border-deepsea-300 focus:bg-white transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-deepsea-800 mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldAlert size={13} className="text-deepsea-500" />
                  接班人签名
                </span>
              </label>
              <input
                type="text"
                value={shiftEnder}
                onChange={e => setShiftEnder(e.target.value)}
                placeholder="请输入接班人姓名"
                className="w-full px-4 py-3 rounded-xl border border-deepsea-100 bg-deepsea-50/40 text-sm text-deepsea-900 placeholder:text-deepsea-400 focus:outline-none focus:ring-4 focus:ring-deepsea-100 focus:border-deepsea-300 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-deepsea-800 mb-2">
              <span className="inline-flex items-center gap-1.5">
                <FileText size={13} className="text-deepsea-500" />
                交接班备注
              </span>
            </label>
            <textarea
              value={remark}
              onChange={e => setRemark(e.target.value)}
              rows={4}
              placeholder="请填写本班次重要事项说明、未完成工作跟进提示、下一班注意事项等..."
              className="w-full px-4 py-3 rounded-xl border border-deepsea-100 bg-deepsea-50/40 text-sm text-deepsea-900 placeholder:text-deepsea-400 focus:outline-none focus:ring-4 focus:ring-deepsea-100 focus:border-deepsea-300 focus:bg-white transition-all resize-none leading-relaxed"
            />
          </div>

          <button
            onClick={handleConfirmHandover}
            className="w-full sm:w-auto sm:min-w-[220px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-deepsea-600 via-deepsea-700 to-deepsea-800 text-white text-sm font-semibold shadow-lg shadow-deepsea-700/20 hover:shadow-xl hover:shadow-deepsea-700/30 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <Save size={16} />
            确认交接班
          </button>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-deepsea-900 flex items-center gap-2">
                <History size={17} className="text-deepsea-500" />
                最近交接班记录
              </h3>
              <span className="text-xs text-deepsea-400">近3条</span>
            </div>

            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-8 text-deepsea-400 text-sm">
                  暂无历史记录
                </div>
              ) : (
                history.map((rec, idx) => (
                  <div
                    key={rec.id}
                    className={cn(
                      'relative rounded-xl p-4 transition-all',
                      idx === 0
                        ? 'bg-gradient-to-br from-[#1B9AAA]/[0.08] to-transparent border border-[#1B9AAA]/20'
                        : 'bg-deepsea-50/40 border border-deepsea-100/60 hover:bg-deepsea-50/70'
                    )}
                  >
                    {idx === 0 && (
                      <span className="absolute -top-2 -right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1B9AAA] text-white shadow-md">
                        最新
                      </span>
                    )}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-deepsea-100 to-deepsea-200 flex items-center justify-center">
                          <Calendar size={14} className="text-deepsea-600" />
                        </div>
                        <div>
                          <div className="text-xs text-deepsea-500">交接编号</div>
                          <div className="font-mono text-sm font-bold text-deepsea-800 tabular-nums">{rec.id}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-deepsea-400">交接时间</div>
                        <div className="text-xs font-semibold text-deepsea-700 whitespace-nowrap">{rec.handedAt}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-deepsea-700 mb-3 px-1">
                      <span className="inline-flex items-center gap-1 font-semibold text-deepsea-800">
                        <UserIcon letter={rec.shiftStarter[0] ?? '?'} />
                        {rec.shiftStarter}
                      </span>
                      <ChevronRight size={13} className="text-deepsea-400" />
                      <span className="inline-flex items-center gap-1 font-semibold text-deepsea-800">
                        <UserIcon letter={rec.shiftEnder[0] ?? '?'} />
                        {rec.shiftEnder}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-white/80 rounded-lg py-2 px-1">
                        <div className="text-[10px] text-deepsea-400">发现</div>
                        <div className="font-mono font-bold text-deepsea-800 text-sm tabular-nums">{rec.foundCount}</div>
                      </div>
                      <div className="bg-white/80 rounded-lg py-2 px-1">
                        <div className="text-[10px] text-deepsea-400">处置</div>
                        <div className="font-mono font-bold text-emerald-600 text-sm tabular-nums">{rec.handledCount}</div>
                      </div>
                      <div className="bg-white/80 rounded-lg py-2 px-1">
                        <div className="text-[10px] text-deepsea-400">升级</div>
                        <div className="font-mono font-bold text-[#D72638] text-sm tabular-nums">{rec.escalateCount}</div>
                      </div>
                      <div className="bg-white/80 rounded-lg py-2 px-1">
                        <div className="text-[10px] text-deepsea-400">响应</div>
                        <div className="font-mono font-bold text-[#b8862d] text-sm tabular-nums">{rec.avgResponseTime}m</div>
                      </div>
                    </div>

                    {rec.remark && (
                      <p className="mt-3 text-[11px] leading-relaxed text-deepsea-600 bg-white/70 rounded-lg px-3 py-2 border border-deepsea-100/60">
                        💬 {rec.remark}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function UserIcon({ letter }: { letter: string }) {
  const colors = [
    'from-[#1B9AAA] to-deepsea-600',
    'from-[#E9B44C] to-[#b8862d]',
    'from-[#FF6B35] to-[#D72638]',
    'from-emerald-500 to-teal-600',
    'from-violet-500 to-purple-600',
  ];
  const idx = letter.charCodeAt(0) % colors.length;
  return (
    <span className={cn(
      'inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br text-white text-[10px] font-bold',
      colors[idx]
    )}>
      {letter}
    </span>
  );
}
