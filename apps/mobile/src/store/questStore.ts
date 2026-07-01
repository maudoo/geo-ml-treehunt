import { create } from 'zustand';
import client from '../api/client';

export type Rarity = 'common' | 'rare' | 'legendary';

interface Tree {
  id: string;
  campus_tag_id: string;
  common_name: string;
  scientific_name: string;
  latitude: number;
  longitude: number;
  times_found: number;
  rarity: Rarity;
}

export interface Quest {
  id: string;
  status: string;
  points_awarded: number;
  assigned_at: string;
  expires_at: string | null;
  completed_at: string | null;
  photo_url: string | null;
  tree: Tree;
}

interface QuestState {
  activeQuest: Quest | null;
  allQuests: Quest[];
  isLoading: boolean;
  pendingPhoto: string | null;
  setPendingPhoto: (uri: string | null) => void;
  fetchQuest: () => Promise<void>;
  fetchAllQuests: () => Promise<void>;
  assignQuest: () => Promise<boolean>;
  submitQuest: (questId: string, photoUrl: string, latitude: number, longitude: number) => Promise<{ result: 'success'; pointsAwarded: number } | { result: 'too_far' | 'expired' | 'error' }>;
  dismissQuest: (questId: string) => Promise<boolean>;
  cancelQuest: (questId: string) => Promise<boolean>;
}

const useQuestStore = create<QuestState>((set, get) => ({
  activeQuest: null,
  allQuests: [],
  isLoading: false,
  pendingPhoto: null,
  setPendingPhoto: (uri) => set({ pendingPhoto: uri }),

  fetchQuest: async () => {
    set({ isLoading: true });
    try {
      const response = await client.get('/quests/me');
      set({ activeQuest: response.data, isLoading: false });
    } catch {
      set({ activeQuest: null, isLoading: false });
    }
  },

  fetchAllQuests: async () => {
    try {
      const response = await client.get('/quests/history');
      set({ allQuests: response.data });
    } catch {
      set({ allQuests: [] });
    }
  },

  assignQuest: async () => {
    set({ isLoading: true });
    try {
      const response = await client.post('/quests/assign');
      set({ activeQuest: response.data, isLoading: false });
      return true;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  submitQuest: async (questId, photoUrl, latitude, longitude) => {
    set({ isLoading: true });
    try {
      const response = await client.post(`/quests/${questId}/submit`, {
        photo_url: photoUrl,
        latitude,
        longitude,
      });
      set({ activeQuest: response.data, isLoading: false, pendingPhoto: null });
      return { result: 'success', pointsAwarded: response.data.points_awarded };
    } catch (error: any) {
      set({ isLoading: false });
      if (error?.response?.status === 403) return { result: 'too_far' };
      if (error?.response?.status === 410) return { result: 'expired' };
      return { result: 'error' };
    }
  },

  dismissQuest: async (questId) => {
    const snapshot = get().activeQuest;
    set({ activeQuest: null }); // optimistic: remove immediately
    try {
      await client.post(`/quests/${questId}/dismiss`);
      return true;
    } catch {
      set({ activeQuest: snapshot }); // revert
      return false;
    }
  },

  cancelQuest: async (questId) => {
    const snapshot = get().activeQuest;
    // optimistic: flip status to cancelled immediately
    set({ activeQuest: snapshot ? { ...snapshot, status: 'cancelled' } : null });
    try {
      await client.post(`/quests/${questId}/cancel`);
      set({ activeQuest: null });
      return true;
    } catch {
      set({ activeQuest: snapshot }); // revert
      return false;
    }
  },
}));

export default useQuestStore;
