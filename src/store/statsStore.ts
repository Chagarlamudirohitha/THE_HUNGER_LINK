import { create } from 'zustand';
import type { Stats } from '../types';

interface StatsState {
  stats: Stats;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getStats: () => Promise<void>;
  clearError: () => void;
}

const initialStats: Stats = {
  totalDonations: 0,
  totalServings: 0,
  totalPeopleFed: 0,
  totalNGOs: 0,
  activeDonations: 0,
  completedDonations: 0
};

const useStatsStore = create<StatsState>((set) => ({
  stats: initialStats,
  isLoading: false,
  error: null,
  
  getStats: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('http://localhost:5000/api/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const stats = await response.json();
      set({ stats, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An error occurred while fetching stats'
      });
    }
  },
  
  clearError: () => {
    set({ error: null });
  }
}));

export default useStatsStore;