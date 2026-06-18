import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  Home,
  ArrowLeft,
  Building2,
  Plus,
  Megaphone,
  ClipboardCheck,
  Save,
  CheckCircle2,
  Phone,
  MessageSquare,
  Clock,
  User,
  Eye,
  AlertTriangle,
  AlertOctagon,
} from 'lucide-react';
import { useHandleStore } from '@/store/handleStore';
import { useClueStore } from '@/store/clueStore';
import Timeline from '@/components/Timeline';
import RiskBadge from '@/components/RiskBadge';
import PlatformLogo from '@/components/PlatformLogo';
import {
  STAGE_NAMES,
  CONTACT_STATUS_NAMES,
  AUDIT_STATUS_NAMES,
  PRIORITY_NAMES,
  PLATFORM_NAMES,
  type EventStage,
  type PlatformType,
  type ContactUnit,
  type ResponseRecord,
  type VerifyItem,
} from '@/types';
import { cn } from '@/lib/utils';

const STAGE_ORDER: EventStage[] = ['found', 'analyze', 'contact', 'respond', 'verify', 'closed'];

const contactStatusColor: Record<ContactUnit['status'], string> = {
  pending: 'bg-slate-100 text-slate-600 border-slate-200',
  contacted: 'bg-[#1B9AAA]/10 text-[#1B9AAA] border-[#1B9AAA]/20',
  replied: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  escalated: 'bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20',
  pending_reply: 'bg-violet-50 text-violet-600 border-violet-200',
  no_response: 'bg-rose-50 text-rose-500 border-rose-200',
};

const auditStatusColor: Record<ResponseRecord['auditStatus'], string> = {
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  reviewing: 'bg-[#E9B44C]/15 text-[#b8862d] border-[#E9B44C]/25',
  approved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  rejected: 'bg-[#D72638]/10 text-[#D72638] border-[#D72638]/20',
  published: 'bg-[#1B9AAA]/10 text-[#1B9AAA] border-[#1B9AAA]/20',
};

const priorityColor: Record<VerifyItem['priority'], string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-[#1B9AAA]/10 text-[#1B9AAA]',
  high: 'bg-[#FF6B35]/10 text-[#FF6B35]',
  urgent: 'bg-[#D72638]/10 text-[#D72638]',
};

const progressBarColor: Record<VerifyItem['priority'], string> = {
  low: 'bg-slate-400',
  medium: 'bg-[#1B9AAA]',
  high: 'bg-[#FF6B35]',
  urgent: 'bg-[#D72638]',
};

const advanceStages: { stage: EventStage; label: string; icon: typeof Phone }[] = [
  { stage: 'contact', label: '联系涉事方', icon: Phone },
  { stage: 'respond', label: '发布回应', icon: Megaphone },
  { stage: 'verify', label: '核实追踪', icon: ClipboardCheck },
  { stage: 'closed', label: '处置闭环', icon: CheckCircle2 },
];

export default function HandleRecordPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { fetchRecord, getRecord, saveRecord, setStage, addContactUnit, addResponse, addVerifyItem, addTimelineEvent } = useHandleStore();
  const { getClueById } = useClueStore();

  const [showUnitForm, setShowUnitForm] = useState(false);
  const [showRespForm, setShowRespForm] = useState(false);
  const [showVerifyForm, setShowVerifyForm] = useState(false);

  const [unitForm, setUnitForm] = useState<Omit<ContactUnit, 'id'>>({ unitName: '', contactPerson: '', phone: '', result: '', status: 'pending' });
  const [respForm, setRespForm] = useState<Omit<ResponseRecord, 'id'>>({ platform: 'weibo', publishedAt: '', content: '', auditStatus: 'draft', views: 0 });
  const [verifyForm, setVerifyForm] = useState<Omit<VerifyItem, 'id'>>({ description: '', owner: '', deadline: '', priority: 'medium', progress: 0 });

  const clue = useMemo(() => getClueById(id), [id, getClueById]);

  useEffect(() => {
    fetchRecord(id);
  }, [id, fetchRecord]);

  const record = getRecord(id);

  const currentStageIndex = record ? STAGE_ORDER.indexOf(record.stage) : 0;

  const handleAddUnit = () => {
    if (!unitForm.unitName) return alert('请填写单位名称');
    addContactUnit(id, unitForm);
    addTimelineEvent(id, { stage: 'contact', title: `新增联系单位：${unitForm.unitName}`, detail: `联系人：${unitForm.contactPerson || '-'}，电话：${unitForm.phone || '-'}`, time: new Date().toISOString().slice(0, 16).replace('T', ' '), operator: '当前操作员' });
    setUnitForm({ unitName: '', contactPerson: '', phone: '', result: '', status: 'pending' });
    setShowUnitForm(false);
  };

  const handleAddResp = () => {
    if (!respForm.content) return alert('请填写回应内容');
    addResponse(id, { ...respForm, publishedAt: respForm.publishedAt || new Date().toISOString().slice(0, 16).replace('T', ' ') });
    addTimelineEvent(id, { stage: 'respond', title: `新增回应记录（${PLATFORM_NAMES[respForm.platform]}）`, detail: respForm.content.slice(0, 60) + (respForm.content.length > 60 ? '...' : ''), time: new Date().toISOString().slice(0, 16).replace('T', ' '), operator: '当前操作员' });
    setRespForm({ platform: 'weibo', publishedAt: '', content: '', auditStatus: 'draft', views: 0 });
    setShowRespForm(false);
  };

  const handleAddVerify = () => {
    if (!verifyForm.description) return alert('请填写事项描述');
    addVerifyItem(id, verifyForm);
    addTimelineEvent(id, { stage: 'verify', title: `新增核实事项`, detail: verifyForm.description.slice(0, 60) + (verifyForm.description.length > 60 ? '...' : ''), time: new Date().toISOString().slice(0, 16).replace('T', ' '), operator: '当前操作员' });
    setVerifyForm({ description: '', owner: '', deadline: '', priority: 'medium', progress: 0 });
    setShowVerifyForm(false);
  };

  const handleAdvanceStage = (s: EventStage) => {
    if (!record) return;
    setStage(id, s);
    addTimelineEvent(id, { stage: s, title: `推进到阶段：${STAGE_NAMES[s]}`, detail: '值班员手动推进处置阶段', time: new Date().toISOString().slice(0, 16).replace('T', ' '), operator: '当前操作员' });
  };

  const handleSaveAll = () => {
    if (record) {
      saveRecord(record);
      alert('所有修改已保存到本地存储');
    }
  };

  if (!record || !clue) {
    return (
      <div className="text-center py-20 animate-slide-up-in">
        <div className="w-12 h-12 border-4 border-deepsea-200 border-t-deepsea-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-deepsea-700 font-semibold">加载处置记录中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up-in">
      <nav className="inline-flex items-center gap-1.5 text-sm text-deepsea-600 bg-white/60 backdrop-blur rounded-xl px-4 py-2 shadow-sm border border-deepsea-100/50">
        <Link to="/" className="inline-flex items-center gap-1 hover:text-deepsea-900 font-medium transition-colors">
          <Home size={14} />
          首页
        </Link>
        <ChevronRight size={14} className="text-deepsea-300" />
        <Link to={`/clue/${id}`} className="hover:text-deepsea-900 font-medium transition-colors max-w-[200px] truncate">
          线索详情
        </Link>
        <ChevronRight size={14} className="text-deepsea-300" />
        <span className="text-deepsea-800 font-semibold">处置记录</span>
      </nav>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => navigate(`/clue/${id}`)}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-deepsea-100 text-deepsea-700 hover:bg-deepsea-50 hover:border-deepsea-200 transition-all shadow-sm shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <RiskBadge level={clue.riskLevel} size="sm" />
              <span className="chip bg-deepsea-50 text-deepsea-600 border border-deepsea-100">{id}</span>
            </div>
            <h1 className="text-xl font-bold text-deepsea-900 truncate">{clue.title}</h1>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-deepsea-900 flex items-center gap-2">
            <Clock size={15} />
            当前处置阶段
          </h3>
          <span className="chip bg-deepsea-600 text-white border border-deepsea-600 shadow-sm">
            {STAGE_NAMES[record.stage]}
          </span>
        </div>
        <div className="relative">
          <div className="absolute top-5 left-8 right-8 h-1 bg-deepsea-100 rounded-full z-0" />
          <div
            className="absolute top-5 left-8 h-1 bg-gradient-to-r from-deepsea-500 to-[#1B9AAA] rounded-full z-10 transition-all duration-500"
            style={{ width: `calc(${(currentStageIndex / (STAGE_ORDER.length - 1)) * 100}% * 0.85)` }}
          />
          <ul className="relative z-20 grid grid-cols-6 gap-2">
            {STAGE_ORDER.map((s, idx) => {
              const done = idx < currentStageIndex;
              const active = idx === currentStageIndex;
              return (
                <li key={s} className="flex flex-col items-center text-center">
                  <span
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 border-4 border-white shadow-md transition-all duration-300',
                      done && 'bg-emerald-500 text-white',
                      active && 'bg-gradient-to-br from-deepsea-600 to-[#1B9AAA] text-white scale-110 animate-pulse-slow',
                      !done && !active && 'bg-deepsea-100 text-deepsea-400'
                    )}
                  >
                    {done ? <CheckCircle2 size={18} /> : idx + 1}
                  </span>
                  <p
                    className={cn(
                      'text-xs font-semibold',
                      active ? 'text-deepsea-800' : done ? 'text-emerald-600' : 'text-slate-400'
                    )}
                  >
                    {STAGE_NAMES[s]}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-deepsea-50 flex items-center justify-between">
            <h3 className="text-base font-bold text-deepsea-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#1B9AAA]/10 text-[#1B9AAA] flex items-center justify-center">
                <Building2 size={15} />
              </span>
              联系单位
              <span className="chip bg-deepsea-50 text-deepsea-600 border border-deepsea-100">{record.contactUnits.length}</span>
            </h3>
            <button
              onClick={() => setShowUnitForm(!showUnitForm)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-deepsea-50 hover:bg-deepsea-100 text-deepsea-700 text-xs font-semibold transition-colors"
            >
              <Plus size={13} />
              新增
            </button>
          </div>
          {showUnitForm && (
            <div className="px-5 py-4 bg-deepsea-50/40 border-b border-deepsea-50 space-y-3 animate-slide-up-in">
              <input placeholder="单位名称 *" value={unitForm.unitName} onChange={e => setUnitForm({ ...unitForm, unitName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-deepsea-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-deepsea-200 focus:border-deepsea-300" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="联系人" value={unitForm.contactPerson} onChange={e => setUnitForm({ ...unitForm, contactPerson: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-deepsea-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-deepsea-200 focus:border-deepsea-300" />
                <input placeholder="电话" value={unitForm.phone} onChange={e => setUnitForm({ ...unitForm, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-deepsea-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-deepsea-200 focus:border-deepsea-300" />
              </div>
              <textarea placeholder="联系结果" rows={2} value={unitForm.result} onChange={e => setUnitForm({ ...unitForm, result: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-deepsea-100 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-deepsea-200 focus:border-deepsea-300" />
              <select value={unitForm.status} onChange={e => setUnitForm({ ...unitForm, status: e.target.value as ContactUnit['status'] })} className="w-full px-3 py-2 rounded-lg border border-deepsea-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-deepsea-200 focus:border-deepsea-300">
                {Object.entries(CONTACT_STATUS_NAMES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <div className="flex items-center gap-2 pt-1">
                <button onClick={handleAddUnit} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-deepsea-600 to-[#1B9AAA] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all">确认添加</button>
                <button onClick={() => setShowUnitForm(false)} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold transition-colors">取消</button>
              </div>
            </div>
          )}
          <ul className="flex-1 divide-y divide-deepsea-50 max-h-[520px] overflow-y-auto scrollbar-thin">
            {record.contactUnits.map(u => (
              <li key={u.id} className="px-5 py-4 hover:bg-deepsea-50/30 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-bold text-deepsea-900">{u.unitName}</p>
                  <span className={cn('chip border shrink-0', contactStatusColor[u.status])}>{CONTACT_STATUS_NAMES[u.status]}</span>
                </div>
                <div className="space-y-1 text-xs text-deepsea-700">
                  <p className="flex items-center gap-1.5">
                    <User size={11} className="text-deepsea-400" />
                    {u.contactPerson || '-'}
                    {u.phone && <span className="text-slate-500 ml-1">· {u.phone}</span>}
                  </p>
                  {u.result && <p className="text-slate-600 leading-relaxed pl-5">{u.result}</p>}
                </div>
              </li>
            ))}
            {record.contactUnits.length === 0 && (
              <li className="px-5 py-12 text-center text-sm text-slate-400">暂无联系单位记录</li>
            )}
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-card overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-deepsea-50 flex items-center justify-between">
            <h3 className="text-base font-bold text-deepsea-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center">
                <Megaphone size={15} />
              </span>
              回应发布
              <span className="chip bg-deepsea-50 text-deepsea-600 border border-deepsea-100">{record.responses.length}</span>
            </h3>
            <button
              onClick={() => setShowRespForm(!showRespForm)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-deepsea-50 hover:bg-deepsea-100 text-deepsea-700 text-xs font-semibold transition-colors"
            >
              <Plus size={13} />
              新增
            </button>
          </div>
          {showRespForm && (
            <div className="px-5 py-4 bg-deepsea-50/40 border-b border-deepsea-50 space-y-3 animate-slide-up-in">
              <div className="grid grid-cols-2 gap-2">
                <select value={respForm.platform} onChange={e => setRespForm({ ...respForm, platform: e.target.value as PlatformType })} className="w-full px-3 py-2 rounded-lg border border-deepsea-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-deepsea-200 focus:border-deepsea-300">
                  {Object.entries(PLATFORM_NAMES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <input type="datetime-local" value={respForm.publishedAt.replace(' ', 'T')} onChange={e => setRespForm({ ...respForm, publishedAt: e.target.value.replace('T', ' ') })} className="w-full px-3 py-2 rounded-lg border border-deepsea-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-deepsea-200 focus:border-deepsea-300" />
              </div>
              <textarea placeholder="回应内容 *" rows={3} value={respForm.content} onChange={e => setRespForm({ ...respForm, content: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-deepsea-100 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-deepsea-200 focus:border-deepsea-300" />
              <div className="grid grid-cols-2 gap-2">
                <select value={respForm.auditStatus} onChange={e => setRespForm({ ...respForm, auditStatus: e.target.value as ResponseRecord['auditStatus'] })} className="w-full px-3 py-2 rounded-lg border border-deepsea-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-deepsea-200 focus:border-deepsea-300">
                  {Object.entries(AUDIT_STATUS_NAMES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <input type="number" placeholder="阅读量" value={respForm.views || ''} onChange={e => setRespForm({ ...respForm, views: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-deepsea-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-deepsea-200 focus:border-deepsea-300" />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button onClick={handleAddResp} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-deepsea-600 to-[#1B9AAA] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all">确认添加</button>
                <button onClick={() => setShowRespForm(false)} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold transition-colors">取消</button>
              </div>
            </div>
          )}
          <ul className="flex-1 divide-y divide-deepsea-50 max-h-[520px] overflow-y-auto scrollbar-thin">
            {record.responses.map(r => (
              <li key={r.id} className="px-5 py-4 hover:bg-deepsea-50/30 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <PlatformLogo platform={r.platform as PlatformType} size={22} />
                    <span className={cn('chip border shrink-0', auditStatusColor[r.auditStatus])}>{AUDIT_STATUS_NAMES[r.auditStatus]}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 shrink-0">
                    <Eye size={10} />
                    {r.views.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-1.5">{r.publishedAt}</p>
                <p className="text-sm text-deepsea-800 leading-relaxed line-clamp-3">{r.content}</p>
              </li>
            ))}
            {record.responses.length === 0 && (
              <li className="px-5 py-12 text-center text-sm text-slate-400">暂无回应发布记录</li>
            )}
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-card overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-deepsea-50 flex items-center justify-between">
            <h3 className="text-base font-bold text-deepsea-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#E9B44C]/15 text-[#b8862d] flex items-center justify-center">
                <ClipboardCheck size={15} />
              </span>
              待核实事项
              <span className="chip bg-deepsea-50 text-deepsea-600 border border-deepsea-100">{record.verifyItems.length}</span>
            </h3>
            <button
              onClick={() => setShowVerifyForm(!showVerifyForm)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-deepsea-50 hover:bg-deepsea-100 text-deepsea-700 text-xs font-semibold transition-colors"
            >
              <Plus size={13} />
              新增
            </button>
          </div>
          {showVerifyForm && (
            <div className="px-5 py-4 bg-deepsea-50/40 border-b border-deepsea-50 space-y-3 animate-slide-up-in">
              <textarea placeholder="事项描述 *" rows={2} value={verifyForm.description} onChange={e => setVerifyForm({ ...verifyForm, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-deepsea-100 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-deepsea-200 focus:border-deepsea-300" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="责任人" value={verifyForm.owner} onChange={e => setVerifyForm({ ...verifyForm, owner: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-deepsea-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-deepsea-200 focus:border-deepsea-300" />
                <input type="datetime-local" value={verifyForm.deadline.replace(' ', 'T')} onChange={e => setVerifyForm({ ...verifyForm, deadline: e.target.value.replace('T', ' ') })} className="w-full px-3 py-2 rounded-lg border border-deepsea-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-deepsea-200 focus:border-deepsea-300" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={verifyForm.priority} onChange={e => setVerifyForm({ ...verifyForm, priority: e.target.value as VerifyItem['priority'] })} className="w-full px-3 py-2 rounded-lg border border-deepsea-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-deepsea-200 focus:border-deepsea-300">
                  {Object.entries(PRIORITY_NAMES).map(([k, v]) => (
                    <option key={k} value={k}>优先级：{v}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <input type="number" min={0} max={100} value={verifyForm.progress || ''} onChange={e => setVerifyForm({ ...verifyForm, progress: Number(e.target.value) })} placeholder="进度%" className="flex-1 px-3 py-2 rounded-lg border border-deepsea-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-deepsea-200 focus:border-deepsea-300" />
                  <span className="text-xs text-slate-500">%</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button onClick={handleAddVerify} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-deepsea-600 to-[#1B9AAA] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all">确认添加</button>
                <button onClick={() => setShowVerifyForm(false)} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold transition-colors">取消</button>
              </div>
            </div>
          )}
          <ul className="flex-1 divide-y divide-deepsea-50 max-h-[520px] overflow-y-auto scrollbar-thin">
            {record.verifyItems.map(v => (
              <li key={v.id} className="px-5 py-4 hover:bg-deepsea-50/30 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-deepsea-900 leading-snug flex-1">{v.description}</p>
                  <span className={cn('chip shrink-0', priorityColor[v.priority])}>{PRIORITY_NAMES[v.priority]}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-2">
                  {v.owner && <span className="inline-flex items-center gap-1"><User size={10} />{v.owner}</span>}
                  {v.deadline && <span className="inline-flex items-center gap-1"><Clock size={10} />{v.deadline}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-deepsea-50 overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all duration-500', progressBarColor[v.priority])} style={{ width: `${v.progress}%` }} />
                  </div>
                  <span className="text-[11px] font-bold text-deepsea-700 w-9 text-right">{v.progress}%</span>
                </div>
              </li>
            ))}
            {record.verifyItems.length === 0 && (
              <li className="px-5 py-12 text-center text-sm text-slate-400">暂无待核实事项</li>
            )}
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Timeline events={record.timeline} title="处置时间线" />
        </div>
        <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <h3 className="text-base font-bold text-deepsea-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-deepsea-500 to-[#1B9AAA] text-white flex items-center justify-center">
              <MessageSquare size={15} />
            </span>
            阶段推进操作
          </h3>
          <div className="space-y-2">
            {advanceStages.map(s => {
              const Icon = s.icon;
              const idx = STAGE_ORDER.indexOf(s.stage);
              const isDone = currentStageIndex > idx;
              const isCurrent = currentStageIndex === idx;
              const disabled = isDone || isCurrent;
              return (
                <button
                  key={s.stage}
                  disabled={disabled}
                  onClick={() => handleAdvanceStage(s.stage)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold border transition-all',
                    disabled
                      ? 'bg-deepsea-50 text-deepsea-400 border-deepsea-100 cursor-not-allowed'
                      : 'bg-white text-deepsea-700 border-deepsea-100 hover:bg-deepsea-50 hover:border-deepsea-300 hover:-translate-y-0.5 hover:shadow-md'
                  )}
                >
                  <span className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    disabled ? 'bg-deepsea-100 text-deepsea-400' : 'bg-deepsea-500/10 text-deepsea-600'
                  )}>
                    {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                  </span>
                  <span className="flex-1 text-left">
                    更新到：{s.label}
                    {isCurrent && <span className="block text-[10px] text-deepsea-400 font-normal">当前阶段</span>}
                    {isDone && !isCurrent && <span className="block text-[10px] text-emerald-500 font-normal">已完成</span>}
                  </span>
                  {!disabled && <ChevronRight size={16} />}
                </button>
              );
            })}
          </div>
          <div className="pt-3 border-t border-deepsea-50">
            <button
              onClick={handleSaveAll}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-deepsea-700 via-deepsea-600 to-[#1B9AAA] text-white font-bold shadow-lg shadow-deepsea-600/25 hover:shadow-xl hover:shadow-deepsea-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Save size={17} />
              保存全部
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">数据将保存到浏览器本地存储</p>
          </div>
        </div>
      </section>
    </div>
  );
}
