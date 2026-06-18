import { create } from 'zustand';
import type {
  HandleRecord,
  EventStage,
  ContactUnit,
  ResponseRecord,
  VerifyItem,
  TimelineEvent,
} from '@/types';
import { getMockHandleRecord } from '@/mock/api';

interface HandleStore {
  records: Record<string, HandleRecord>;

  fetchRecord: (clueId: string) => Promise<HandleRecord>;
  getRecord: (clueId: string) => HandleRecord | undefined;
  saveRecord: (record: HandleRecord) => void;
  setStage: (clueId: string, stage: EventStage) => void;
  addContactUnit: (clueId: string, unit: Omit<ContactUnit, 'id'>) => void;
  addResponse: (clueId: string, resp: Omit<ResponseRecord, 'id'>) => void;
  addVerifyItem: (clueId: string, item: Omit<VerifyItem, 'id'>) => void;
  addTimelineEvent: (clueId: string, event: Omit<TimelineEvent, 'id'>) => void;
}

const STORAGE_KEY = 'opinion-handle-records';

function loadFromStorage(): Record<string, HandleRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {};
}

function saveToStorage(records: Record<string, HandleRecord>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (_) {}
}

export const useHandleStore = create<HandleStore>((set, get) => ({
  records: loadFromStorage(),

  fetchRecord: async (clueId) => {
    await new Promise(r => setTimeout(r, 250));
    const stored = get().records[clueId];
    if (stored) return stored;
    const mock = getMockHandleRecord(clueId);
    set(state => {
      const newRecords = { ...state.records, [clueId]: mock };
      saveToStorage(newRecords);
      return { records: newRecords };
    });
    return mock;
  },

  getRecord: (clueId) => get().records[clueId],

  saveRecord: (record) => {
    set(state => {
      const newRecords = { ...state.records, [record.clueId]: record };
      saveToStorage(newRecords);
      return { records: newRecords };
    });
  },

  setStage: (clueId, stage) => {
    set(state => {
      const rec = state.records[clueId];
      if (!rec) return state;
      const newRec = { ...rec, stage, updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') };
      const newRecords = { ...state.records, [clueId]: newRec };
      saveToStorage(newRecords);
      return { records: newRecords };
    });
  },

  addContactUnit: (clueId, unit) => {
    set(state => {
      const rec = state.records[clueId];
      if (!rec) return state;
      const newUnit: ContactUnit = { ...unit, id: 'cu' + Date.now() };
      const newRec = {
        ...rec,
        contactUnits: [...rec.contactUnits, newUnit],
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      const newRecords = { ...state.records, [clueId]: newRec };
      saveToStorage(newRecords);
      return { records: newRecords };
    });
  },

  addResponse: (clueId, resp) => {
    set(state => {
      const rec = state.records[clueId];
      if (!rec) return state;
      const newResp: ResponseRecord = { ...resp, id: 'rr' + Date.now() };
      const newRec = {
        ...rec,
        responses: [...rec.responses, newResp],
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      const newRecords = { ...state.records, [clueId]: newRec };
      saveToStorage(newRecords);
      return { records: newRecords };
    });
  },

  addVerifyItem: (clueId, item) => {
    set(state => {
      const rec = state.records[clueId];
      if (!rec) return state;
      const newItem: VerifyItem = { ...item, id: 'vi' + Date.now() };
      const newRec = {
        ...rec,
        verifyItems: [...rec.verifyItems, newItem],
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      const newRecords = { ...state.records, [clueId]: newRec };
      saveToStorage(newRecords);
      return { records: newRecords };
    });
  },

  addTimelineEvent: (clueId, event) => {
    set(state => {
      const rec = state.records[clueId];
      if (!rec) return state;
      const newEvent: TimelineEvent = { ...event, id: 't' + Date.now() };
      const newRec = {
        ...rec,
        timeline: [...rec.timeline, newEvent],
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      const newRecords = { ...state.records, [clueId]: newRec };
      saveToStorage(newRecords);
      return { records: newRecords };
    });
  },
}));
