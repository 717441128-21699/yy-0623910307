import { create } from 'zustand';
import type { Clue, StatsSummary, RiskLevel, RiskAdjustRecord } from '@/types';
import { MOCK_CLUES, MOCK_STATS, getMockClue } from '@/mock/api';

const CLUE_STORAGE_KEY = 'psy-clue-overrides';

interface ClueOverride {
  riskLevel?: RiskLevel;
  adjustHistory?: RiskAdjustRecord[];
  isClosed?: boolean;
  currentStage?: string;
}

function loadOverrides(): Record<string, ClueOverride> {
  try {
    const raw = localStorage.getItem(CLUE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveOverrides(overrides: Record<string, ClueOverride>) {
  localStorage.setItem(CLUE_STORAGE_KEY, JSON.stringify(overrides));
}

function applyOverrides(clues: Clue[]): Clue[] {
  const overrides = loadOverrides();
  if (Object.keys(overrides).length === 0) return clues;
  return clues.map(c => {
    const o = overrides[c.id];
    if (!o) return c;
    return {
      ...c,
      riskLevel: o.riskLevel ?? c.riskLevel,
      adjustHistory: o.adjustHistory ?? c.adjustHistory,
      isClosed: o.isClosed ?? c.isClosed,
      currentStage: (o.currentStage as any) ?? c.currentStage,
    };
  });
}

interface ClueStore {
  clues: Clue[];
  stats: StatsSummary | null;
  loading: boolean;
  filterRisk: 'all' | RiskLevel;
  filterPlatform: string;
  filterKeyword: string;
  filterTimeRange: '1h' | '6h' | '24h';

  fetchClues: () => Promise<void>;
  fetchStats: () => Promise<void>;
  getClueById: (id: string) => Clue | undefined;
  getClue: (id: string) => Clue | undefined;
  setFilterRisk: (v: 'all' | RiskLevel) => void;
  setFilterPlatform: (v: string) => void;
  setFilterKeyword: (v: string) => void;
  setFilterTimeRange: (v: '1h' | '6h' | '24h') => void;
  adjustRiskLevel: (clueId: string, toLevel: RiskLevel, reason: string, remark: string, judgment?: string) => void;
  updateClueStage: (clueId: string, stage: string) => void;
  getFilteredClues: () => Clue[];
}

export const useClueStore = create<ClueStore>((set, get) => ({
  clues: [],
  stats: null,
  loading: false,
  filterRisk: 'all',
  filterPlatform: 'all',
  filterKeyword: '',
  filterTimeRange: '24h',

  fetchClues: async () => {
    set({ loading: true });
    await new Promise(r => setTimeout(r, 300));
    set({ clues: applyOverrides([...MOCK_CLUES]), loading: false });
  },

  fetchStats: async () => {
    await new Promise(r => setTimeout(r, 200));
    set({ stats: { ...MOCK_STATS } });
  },

  getClueById: (id) => {
    const found = get().clues.find(c => c.id === id);
    if (found) return found;
    const overrides = loadOverrides();
    const mock = getMockClue(id);
    if (!mock) return undefined;
    const o = overrides[id];
    if (!o) return mock;
    return {
      ...mock,
      riskLevel: o.riskLevel ?? mock.riskLevel,
      adjustHistory: o.adjustHistory ?? mock.adjustHistory,
      isClosed: o.isClosed ?? mock.isClosed,
      currentStage: (o.currentStage as any) ?? mock.currentStage,
    };
  },

  getClue: (id) => get().getClueById(id),

  setFilterRisk: (v) => set({ filterRisk: v }),
  setFilterPlatform: (v) => set({ filterPlatform: v }),
  setFilterKeyword: (v) => set({ filterKeyword: v }),
  setFilterTimeRange: (v) => set({ filterTimeRange: v }),

  adjustRiskLevel: (clueId, toLevel, reason, remark, judgment) => {
    const record: RiskAdjustRecord = {
      id: 'r' + Date.now(),
      fromLevel: get().getClueById(clueId)?.riskLevel || 'watch',
      toLevel,
      reason,
      remark,
      judgment,
      operator: '当前操作员',
      time: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    const overrides = loadOverrides();
    const existing = overrides[clueId] || {};
    const existingHistory = existing.adjustHistory || get().getClueById(clueId)?.adjustHistory || [];
    overrides[clueId] = {
      ...existing,
      riskLevel: toLevel,
      adjustHistory: [...existingHistory, record],
    };
    saveOverrides(overrides);

    set(state => ({
      clues: state.clues.map(c => {
        if (c.id !== clueId) return c;
        return {
          ...c,
          riskLevel: toLevel,
          adjustHistory: [...(c.adjustHistory || []), record],
        };
      }),
    }));
  },

  updateClueStage: (clueId, stage) => {
    const overrides = loadOverrides();
    const existing = overrides[clueId] || {};
    overrides[clueId] = {
      ...existing,
      currentStage: stage,
      isClosed: stage === 'closed' ? true : existing.isClosed,
    };
    saveOverrides(overrides);

    set(state => ({
      clues: state.clues.map(c => {
        if (c.id !== clueId) return c;
        return {
          ...c,
          currentStage: stage as any,
          isClosed: stage === 'closed' ? true : c.isClosed,
        };
      }),
    }));
  },

  getFilteredClues: () => {
    const { clues, filterRisk, filterPlatform, filterKeyword } = get();
    return clues.filter(c => {
      if (filterRisk !== 'all' && c.riskLevel !== filterRisk) return false;
      if (filterPlatform !== 'all' && c.platform !== filterPlatform) return false;
      if (filterKeyword) {
        const kw = filterKeyword.toLowerCase();
        return (
          c.title.toLowerCase().includes(kw) ||
          c.summary.toLowerCase().includes(kw) ||
          c.keywords.some(k => k.toLowerCase().includes(kw))
        );
      }
      return true;
    });
  },
}));
