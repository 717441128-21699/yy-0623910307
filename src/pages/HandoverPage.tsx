import { useEffect, useState, useMemo } from 'react';
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
  ChevronDown,
  ChevronUp,
  Star,
  User as UserIcon,
  ListTodo,
} from 'lucide-react';
import * as api from '@/mock/api';
import type { HandoverRecord, RiskLevel, OpenClue, KeyHandoverItem, HandoverClueSnapshot } from '@/types';
import { RISK_NAMES, STAGE_NAMES, REASON_NAMES } from '@/types';
import { cn } from '@/lib/utils';
import StatCard from '@/components/StatCard';
import { useClueStore } from '@/store/clueStore';
import { useHandleStore } from '@/store/handleStore';
import RiskBadge from '@/components/RiskBadge';

const HANDOVER_STORAGE_KEY = 'psy-handover-records';

function loadHandoverHistory(): HandoverRecord[] {
  try {
    const raw = localStorage.getItem(HANDOVER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveHandoverHistory(records: HandoverRecord[]) {
  localStorage.setItem(HANDOVER_STORAGE_KEY, JSON.stringify(records));
}

export default function HandoverPage() {
  const navigate = useNavigate();
  const { clues, fetchClues } = useClueStore();
  const { records: handleRecords } = useHandleStore();

  const [history, setHistory] = useState<HandoverRecord[]>([]);
  const [shiftStarter, setShiftStarter] = useState('');
  const [shiftEnder, setShiftEnder] = useState('');
  const [remark, setRemark] = useState('');
  const [nowTime, setNowTime] = useState(new Date());
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  // key: clueId, value: instruction text
  const [keyItemInstructions, setKeyItemInstructions] = useState<Record<string, string>>({});
  // key: clueId, value: boolean
  const [keyItemChecked, setKeyItemChecked] = useState<Record<string, boolean>>({});

  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [bulkInstruction, setBulkInstruction] = useState('');

  useEffect(() => {
    fetchClues();
    const stored = loadHandoverHistory();
    if (stored.length > 0) {
      setHistory(stored);
    } else {
      api.getRecentHandovers(3).then(mockHistory => {
        setHistory(mockHistory);
        saveHandoverHistory(mockHistory);
      });
    }
    const t = setInterval(() => setNowTime(new Date()), 60000);
    return () => clearInterval(t);
  }, [fetchClues]);

  const unclosedClues = useMemo(() => {
    const result: OpenClue[] = [];
    for (const clue of clues) {
      if (clue.isClosed) continue;
      const hr = handleRecords[clue.id];
      const stage = hr?.stage || clue.currentStage || 'found';
      if (stage === 'closed') continue;
      let todoText = '';
      // 优先使用最新风险研判信息
      if (clue.adjustHistory && clue.adjustHistory.length > 0) {
        const lastAdjust = clue.adjustHistory[clue.adjustHistory.length - 1];
        const reasonName = REASON_NAMES[lastAdjust.reason] || lastAdjust.reason;
        const levelName = RISK_NAMES[lastAdjust.toLevel];
        if (lastAdjust.judgment) {
          todoText = `【${levelName}·${reasonName}】${lastAdjust.judgment}`;
        } else {
          todoText = `风险等级调整为${levelName}，原因：${reasonName}。${lastAdjust.remark || '待重点跟进'}`;
        }
      }
      // 其次用最近处置时间线
      if (!todoText && hr && hr.timeline && hr.timeline.length > 0) {
        const lastEvt = hr.timeline[hr.timeline.length - 1];
        todoText = lastEvt.detail || lastEvt.title;
      }
      if (!todoText) {
        todoText = hr ? `处置阶段：${STAGE_NAMES[stage as any] || stage}，待继续推进` : '尚未启动处置流程';
      }
      result.push({
        id: clue.id,
        riskLevel: clue.riskLevel,
        keywords: clue.keywords,
        foundAt: clue.publishedAt,
        timeAgo: clue.timeAgo,
        stage: stage as any,
        todo: todoText,
      });
    }
    return result;
  }, [clues, handleRecords]);

  const shiftStats = useMemo(() => {
    const foundCount = clues.length;
    const handledCount = clues.filter(c => c.isClosed || c.currentStage === 'closed').length;
    const escalateCount = clues.filter(c => c.riskLevel === 'escalate').length;
    return {
      foundCount,
      handledCount,
      escalateCount,
      avgResponseTime: history[0]?.avgResponseTime ?? 18,
    };
  }, [clues, history]);

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

  const toggleKeyItem = (clueId: string) => {
    setKeyItemChecked(prev => ({ ...prev, [clueId]: !prev[clueId] }));
  };

  const filteredUnclosedClues = useMemo(() => {
    return unclosedClues.filter(c => {
      if (riskFilter !== 'all' && c.riskLevel !== riskFilter) return false;
      if (stageFilter !== 'all' && c.stage !== stageFilter) return false;
      return true;
    });
  }, [unclosedClues, riskFilter, stageFilter]);

  const checkedCount = Object.values(keyItemChecked).filter(Boolean).length;

  const handleBulkSetInstruction = () => {
    if (!bulkInstruction.trim()) return;
    const updated: Record<string, string> = { ...keyItemInstructions };
    for (const id of Object.keys(keyItemChecked)) {
      if (keyItemChecked[id]) {
        updated[id] = bulkInstruction.trim();
      }
    }
    setKeyItemInstructions(updated);
    setBulkInstruction('');
  };

  const handleSelectAllVisible = () => {
    const updated = { ...keyItemChecked };
    filteredUnclosedClues.forEach(c => {
      updated[c.id] = true;
    });
    setKeyItemChecked(updated);
  };

  const handleClearAllChecked = () => {
    setKeyItemChecked({});
    setKeyItemInstructions({});
  };

  const handleConfirmHandover = () => {
    if (!shiftStarter.trim() || !shiftEnder.trim()) {
      alert('请填写交班人和接班人签名');
      return;
    }
    const keyItems: KeyHandoverItem[] = unclosedClues
      .filter(c => keyItemChecked[c.id])
      .map(c => ({
        clueId: c.id,
        keywords: c.keywords,
        riskLevel: c.riskLevel,
        instruction: keyItemInstructions[c.id]?.trim() || '请接班同志重点跟进',
      }));

    const clueToSnapshot = (c: any): HandoverClueSnapshot => ({
      id: c.id,
      keywords: c.keywords,
      riskLevel: c.riskLevel,
      title: c.title,
    });

    const newClues: HandoverClueSnapshot[] = clues.slice(0, 6).map(clueToSnapshot);
    const escalatedClues: HandoverClueSnapshot[] = clues.filter(c => c.riskLevel === 'escalate').map(clueToSnapshot);
    const closedClues: HandoverClueSnapshot[] = clues.filter(c => c.isClosed || c.currentStage === 'closed').map(clueToSnapshot);

    const newRecord: HandoverRecord = {
      id: 'H' + Date.now().toString().slice(-10),
      shiftStarter: shiftStarter.trim(),
      shiftEnder: shiftEnder.trim(),
      handedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      foundCount: shiftStats.foundCount,
      handledCount: shiftStats.handledCount,
      escalateCount: shiftStats.escalateCount,
      avgResponseTime: shiftStats.avgResponseTime,
      remark: remark.trim(),
      keyItems,
      newClues,
      escalatedClues,
      closedClues,
    };
    const updatedHistory = [newRecord, ...history].slice(0, 20);
    saveHandoverHistory(updatedHistory);
    setHistory(updatedHistory);
    setShiftStarter('');
    setShiftEnder('');
    setRemark('');
    setKeyItemChecked({});
    setKeyItemInstructions({});
    setConfirmSuccess(true);
    setTimeout(() => setConfirmSuccess(false), 2500);
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
                {unclosedClues.length} 条待跟进
              </span>
            </h2>
            <p className="text-xs text-deepsea-500 mt-1 ml-7">
              勾选"重点交办"可将该线索加入本次交接班的重点事项，并填写交办说明
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs rounded-lg border border-deepsea-200 bg-white text-deepsea-700 focus:outline-none focus:ring-2 focus:ring-[#1B9AAA]/30"
            >
              <option value="all">全部等级</option>
              <option value="watch">关注</option>
              <option value="warn">预警</option>
              <option value="escalate">升级</option>
            </select>
            <select
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-deepsea-200 bg-white text-deepsea-700 focus:outline-none focus:ring-2 focus:ring-[#1B9AAA]/30"
            >
              <option value="all">全部阶段</option>
              {Object.entries(STAGE_NAMES).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {checkedCount > 0 && (
          <div className="px-6 py-3 bg-[#E9B44C]/[0.08] border-b border-[#E9B44C]/20 flex items-center gap-3 flex-wrap">
            <Star size={14} className="text-[#E9B44C]" fill="currentColor" />
            <span className="text-sm font-bold text-[#b8862d]">已选 {checkedCount} 条重点交办</span>
            <div className="flex-1 flex items-center gap-2 min-w-[240px]">
              <input
                type="text"
                value={bulkInstruction}
                onChange={e => setBulkInstruction(e.target.value)}
                placeholder="批量填写交办说明（将覆盖所选线索）..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#E9B44C]/30 bg-white focus:outline-none focus:ring-2 focus:ring-[#E9B44C]/40"
              />
              <button
                onClick={handleBulkSetInstruction}
                className="px-3 py-1.5 text-xs font-bold bg-[#E9B44C] text-white rounded-lg hover:bg-[#d9a33c] transition-colors"
              >
                批量应用
              </button>
            </div>
            <button
              onClick={handleSelectAllVisible}
              className="text-[11px] text-deepsea-600 hover:text-deepsea-800 underline"
            >
              全选当前筛选
            </button>
            <button
              onClick={handleClearAllChecked}
              className="text-[11px] text-slate-500 hover:text-slate-700 underline"
            >
              清空选择
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-deepsea-50/70 text-deepsea-700">
                <th className="text-center px-3 py-3 font-semibold w-16">
                  <Star size={16} className="mx-auto text-[#E9B44C]" />
                </th>
                <th className="text-left px-3 py-3 font-semibold w-1.5"></th>
                <th className="text-left px-3 py-3 font-semibold">风险</th>
                <th className="text-left px-3 py-3 font-semibold">关键词</th>
                <th className="text-left px-3 py-3 font-semibold">首次发现</th>
                <th className="text-left px-3 py-3 font-semibold">当前阶段</th>
                <th className="text-left px-3 py-3 font-semibold">待办摘要</th>
                <th className="text-right px-6 py-3 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnclosedClues.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-deepsea-400">
                    🔍 当前筛选条件下没有未闭环线索
                  </td>
                </tr>
              ) : (
                filteredUnclosedClues.map((clue, idx) => {
                  const isChecked = !!keyItemChecked[clue.id];
                  return (
                    <tr
                      key={clue.id}
                      className={cn(
                        'border-t border-deepsea-50 transition-colors',
                        idx % 2 === 1 ? 'bg-slate-50/50' : '',
                        clue.riskLevel === 'escalate' ? 'bg-[#D72638]/[0.04]' : '',
                        isChecked && 'bg-[#E9B44C]/[0.08]'
                      )}
                    >
                      <td className="text-center px-3 py-4">
                        <button
                          onClick={() => toggleKeyItem(clue.id)}
                          className={cn(
                            'inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all',
                            isChecked
                              ? 'bg-[#E9B44C] text-white shadow-md scale-110'
                              : 'bg-deepsea-50 text-deepsea-300 hover:bg-[#E9B44C]/20 hover:text-[#E9B44C]'
                          )}
                        >
                          <Star size={15} fill={isChecked ? 'currentColor' : 'none'} />
                        </button>
                      </td>
                      <td className="w-1.5 px-0 py-0">
                        <div className={cn('w-1 h-full min-h-[72px]', riskColorBar[clue.riskLevel])} />
                      </td>
                      <td className="px-3 py-4">
                        <RiskBadge level={clue.riskLevel} size="sm" />
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
                          {STAGE_NAMES[clue.stage] || clue.stage}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-deepsea-700 max-w-[340px]">
                        <div className="flex items-start gap-1.5">
                          <ListTodo size={13} className="text-deepsea-400 mt-0.5 shrink-0" />
                          <p className="line-clamp-2 text-xs leading-relaxed">{clue.todo}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/clue/${clue.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-deepsea-600 hover:text-deepsea-900 hover:bg-deepsea-50 transition"
                        >
                          查看详情
                          <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {unclosedClues.some(c => keyItemChecked[c.id]) && (
          <div className="bg-gradient-to-br from-[#E9B44C]/[0.08] via-white to-transparent border-t border-[#E9B44C]/20 px-6 py-5 animate-slide-up-in">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E9B44C] to-[#b8862d] flex items-center justify-center shrink-0">
                <Star size={18} className="text-white" fill="white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-deepsea-900 flex items-center gap-2">
                  重点交办区
                  <span className="chip bg-[#E9B44C]/15 text-[#b8862d] border border-[#E9B44C]/25">
                    {unclosedClues.filter(c => keyItemChecked[c.id]).length} 条重点事项
                  </span>
                </h3>
                <p className="text-xs text-deepsea-500 mt-1">请为每条重点事项填写交办说明，接班同志将优先跟进</p>
              </div>
            </div>
            <div className="space-y-3">
              {unclosedClues
                .filter(c => keyItemChecked[c.id])
                .map(c => (
                  <div key={c.id} className="bg-white rounded-xl p-4 border border-[#E9B44C]/20 shadow-sm">
                    <div className="flex items-center gap-2 flex-wrap mb-2.5">
                      <RiskBadge level={c.riskLevel} size="sm" />
                      {c.keywords.slice(0, 3).map(k => (
                        <span key={k} className="chip bg-deepsea-50 text-deepsea-700 border border-deepsea-100 text-xs">
                          #{k}
                        </span>
                      ))}
                      <span className="text-xs text-slate-500 font-mono ml-auto">{c.id}</span>
                    </div>
                    <input
                      type="text"
                      value={keyItemInstructions[c.id] || ''}
                      onChange={e => setKeyItemInstructions(prev => ({ ...prev, [c.id]: e.target.value }))}
                      placeholder="请填写交办说明：如 请接班同志第一时间联系街道办核实，关注微信传播态势..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-deepsea-100 bg-deepsea-50/40 text-sm text-deepsea-900 placeholder:text-deepsea-300 focus:outline-none focus:ring-4 focus:ring-[#E9B44C]/20 focus:border-[#E9B44C]/40 focus:bg-white transition-all"
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
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
              rows={3}
              placeholder="请填写本班次重要事项说明、未完成工作跟进提示、下一班注意事项等..."
              className="w-full px-4 py-3 rounded-xl border border-deepsea-100 bg-deepsea-50/40 text-sm text-deepsea-900 placeholder:text-deepsea-400 focus:outline-none focus:ring-4 focus:ring-deepsea-100 focus:border-deepsea-300 focus:bg-white transition-all resize-none leading-relaxed"
            />
          </div>

          <button
            onClick={handleConfirmHandover}
            className={cn(
              'w-full sm:w-auto sm:min-w-[260px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg transition-all',
              confirmSuccess
                ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                : 'bg-gradient-to-br from-deepsea-600 via-deepsea-700 to-deepsea-800 text-white shadow-deepsea-700/20 hover:shadow-xl hover:shadow-deepsea-700/30 hover:-translate-y-0.5 active:translate-y-0'
            )}
          >
            {confirmSuccess ? (
              <>
                <CheckCircle2 size={17} />
                交接班确认成功
              </>
            ) : (
              <>
                <Save size={17} />
                确认交接班
                {Object.keys(keyItemChecked).filter(k => keyItemChecked[k]).length > 0 && (
                  <span className="chip bg-white/15 text-white border-white/20 ml-1">
                    {Object.keys(keyItemChecked).filter(k => keyItemChecked[k]).length} 条重点交办
                  </span>
                )}
              </>
            )}
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
                history.slice(0, 3).map((rec, idx) => {
                  const isExpanded = expandedRecord === rec.id;
                  return (
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
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedRecord(isExpanded ? null : rec.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-deepsea-100 to-deepsea-200 flex items-center justify-center">
                            <Calendar size={14} className="text-deepsea-600" />
                          </div>
                          <div>
                            <div className="text-xs text-deepsea-500">交接编号</div>
                            <div className="font-mono text-sm font-bold text-deepsea-800 tabular-nums">{rec.id}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {rec.keyItems && rec.keyItems.length > 0 && (
                            <span className="chip bg-[#E9B44C]/15 text-[#b8862d] border border-[#E9B44C]/25">
                              <Star size={11} fill="currentColor" className="mr-0.5" />
                              {rec.keyItems.length} 项交办
                            </span>
                          )}
                          <div className="text-right mr-1">
                            <div className="text-[11px] text-deepsea-400">交接时间</div>
                            <div className="text-xs font-semibold text-deepsea-700 whitespace-nowrap">{rec.handedAt}</div>
                          </div>
                          {isExpanded ? <ChevronUp size={16} className="text-deepsea-400" /> : <ChevronDown size={16} className="text-deepsea-400" />}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-deepsea-700 my-3 px-1">
                        <span className="inline-flex items-center gap-1 font-semibold text-deepsea-800">
                          <AvatarLetter letter={rec.shiftStarter[0] ?? '?'} />
                          {rec.shiftStarter}
                        </span>
                        <ChevronRight size={13} className="text-deepsea-400" />
                        <span className="inline-flex items-center gap-1 font-semibold text-deepsea-800">
                          <AvatarLetter letter={rec.shiftEnder[0] ?? '?'} />
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

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-deepsea-100 space-y-4 animate-slide-up-in">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="bg-deepsea-50/60 rounded-lg p-2.5 text-center">
                              <div className="text-[10px] text-deepsea-500 mb-0.5">本班新增</div>
                              <div className="font-mono font-bold text-deepsea-700 text-sm tabular-nums">
                                {rec.newClues?.length ?? rec.foundCount}
                              </div>
                            </div>
                            <div className="bg-[#D72638]/5 rounded-lg p-2.5 text-center">
                              <div className="text-[10px] text-[#D72638] mb-0.5">升级线索</div>
                              <div className="font-mono font-bold text-[#D72638] text-sm tabular-nums">
                                {rec.escalatedClues?.length ?? rec.escalateCount}
                              </div>
                            </div>
                            <div className="bg-emerald-500/8 rounded-lg p-2.5 text-center">
                              <div className="text-[10px] text-emerald-600 mb-0.5">闭环完成</div>
                              <div className="font-mono font-bold text-emerald-600 text-sm tabular-nums">
                                {rec.closedClues?.length ?? rec.handledCount}
                              </div>
                            </div>
                            <div className="bg-[#E9B44C]/15 rounded-lg p-2.5 text-center">
                              <div className="text-[10px] text-[#b8862d] mb-0.5">重点交办</div>
                              <div className="font-mono font-bold text-[#b8862d] text-sm tabular-nums">
                                {rec.keyItems?.length ?? 0}
                              </div>
                            </div>
                          </div>

                          {(rec.newClues && rec.newClues.length > 0) && (
                            <div>
                              <div className="text-[11px] font-bold text-deepsea-700 mb-2 flex items-center gap-1.5">
                                <span className="w-1.5 h-3 rounded-full bg-[#1B9AAA]" />
                                本班新增线索
                              </div>
                              <div className="space-y-1.5">
                                {rec.newClues.slice(0, 4).map(c => (
                                  <Link
                                    key={c.id}
                                    to={`/clue/${c.id}`}
                                    className="flex items-center gap-2 p-2 rounded-lg bg-white hover:bg-deepsea-50 transition-colors border border-deepsea-100/50 group"
                                  >
                                    <RiskBadge level={c.riskLevel} size="sm" />
                                    <span className="flex-1 text-xs text-deepsea-700 truncate font-medium group-hover:text-deepsea-900">
                                      {c.keywords.slice(0, 2).join(' · ')}
                                    </span>
                                    <ChevronRight size={12} className="text-deepsea-300 group-hover:text-deepsea-500 transition-colors" />
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                          {(rec.escalatedClues && rec.escalatedClues.length > 0) && (
                            <div>
                              <div className="text-[11px] font-bold text-[#D72638] mb-2 flex items-center gap-1.5">
                                <span className="w-1.5 h-3 rounded-full bg-[#D72638]" />
                                升级线索（需重点关注）
                              </div>
                              <div className="space-y-1.5">
                                {rec.escalatedClues.map(c => (
                                  <Link
                                    key={c.id}
                                    to={`/clue/${c.id}`}
                                    className="flex items-center gap-2 p-2 rounded-lg bg-[#D72638]/[0.04] hover:bg-[#D72638]/[0.08] transition-colors border border-[#D72638]/10 group"
                                  >
                                    <AlertOctagon size={13} className="text-[#D72638] shrink-0" />
                                    <span className="flex-1 text-xs text-deepsea-700 truncate font-medium group-hover:text-deepsea-900">
                                      {c.keywords.slice(0, 2).join(' · ')}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">{c.id}</span>
                                    <ChevronRight size={12} className="text-deepsea-300 group-hover:text-deepsea-500 transition-colors" />
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                          {rec.closedClues && rec.closedClues.length > 0 && (
                            <div>
                              <div className="text-[11px] font-bold text-emerald-600 mb-2 flex items-center gap-1.5">
                                <span className="w-1.5 h-3 rounded-full bg-emerald-500" />
                                本班闭环
                              </div>
                              <div className="space-y-1.5">
                                {rec.closedClues.slice(0, 3).map(c => (
                                  <Link
                                    key={c.id}
                                    to={`/clue/${c.id}`}
                                    className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors border border-emerald-200/30 group"
                                  >
                                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                                    <span className="flex-1 text-xs text-deepsea-700 truncate font-medium group-hover:text-deepsea-900">
                                      {c.keywords.slice(0, 2).join(' · ')}
                                    </span>
                                    <ChevronRight size={12} className="text-deepsea-300 group-hover:text-deepsea-500 transition-colors" />
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                          {rec.keyItems && rec.keyItems.length > 0 && (
                            <div>
                              <div className="text-[11px] font-bold text-[#b8862d] mb-2 flex items-center gap-1">
                                <Star size={12} fill="currentColor" />
                                重点交办事项（{rec.keyItems.length}）
                              </div>
                              <div className="space-y-2">
                                {rec.keyItems.map((item, iidx) => (
                                  <Link
                                    key={iidx}
                                    to={`/clue/${item.clueId}`}
                                    className="block bg-[#E9B44C]/[0.06] border border-[#E9B44C]/15 rounded-lg p-2.5 hover:bg-[#E9B44C]/[0.1] transition-colors group"
                                  >
                                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                      <RiskBadge level={item.riskLevel as RiskLevel} size="sm" />
                                      {item.keywords.slice(0, 3).map(k => (
                                        <span key={k} className="chip bg-white text-deepsea-700 border border-deepsea-100 text-[11px]">
                                          #{k}
                                        </span>
                                      ))}
                                      <span className="text-[10px] text-slate-500 font-mono ml-auto">{item.clueId}</span>
                                    </div>
                                    <p className="text-xs leading-relaxed text-deepsea-700 pl-4 relative flex items-start gap-1">
                                      <span className="absolute left-0 top-0 text-[#E9B44C] font-bold">→</span>
                                      {item.instruction}
                                    </p>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                          {rec.remark && (
                            <p className="text-[11px] leading-relaxed text-deepsea-600 bg-white/70 rounded-lg px-3 py-2 border border-deepsea-100/60">
                              💬 {rec.remark}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function AvatarLetter({ letter }: { letter: string }) {
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
