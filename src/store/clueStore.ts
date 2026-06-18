import { create } from 'zustand';
import type { Clue, StatsSummary, RiskLevel, RiskAdjustRecord } from '@/types';
import { MOCK_CLUES, MOCK_STATS, getMockClue } from '@/mock/api';

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
  adjustRiskLevel: (clueId: string, toLevel: RiskLevel, reason: string, remark: string) => void;
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
    set({ clues: [...MOCK_CLUES], loading: false });
  },

  fetchStats: async () => {
    await new Promise(r => setTimeout(r, 200));
    set({ stats: { ...MOCK_STATS } });
  },

  getClueById: (id) => {
    const found = get().clues.find(c => c.id === id);
    if (found) return found;
    return getMockClue(id);
  },

  getClue: (id) => get().getClueById(id),

  setFilterRisk: (v) => set({ filterRisk: v }),
  setFilterPlatform: (v) => set({ filterPlatform: v }),
  setFilterKeyword: (v) => set({ filterKeyword: v }),
  setFilterTimeRange: (v) => set({ filterTimeRange: v }),

  adjustRiskLevel: (clueId, toLevel, reason, remark) => {
    const record: RiskAdjustRecord = {
      id: 'r' + Date.now(),
      fromLevel: get().getClueById(clueId)?.riskLevel || 'watch',
      toLevel,
      reason,
      remark,
      operator: '当前操作员',
      time: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
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
