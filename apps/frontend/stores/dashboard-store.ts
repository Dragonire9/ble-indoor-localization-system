import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PaginationParams } from '@/types/pagination';

export interface DashboardFilters extends PaginationParams {
  sectorId?: string;
  connectionState?: 'ONLINE' | 'OFFLINE';
  searchValue?: string;
}

interface DashboardStore {
  filters: DashboardFilters;
  setFilters: (filters: DashboardFilters | ((prev: DashboardFilters) => DashboardFilters)) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      filters: { page: 1, limit: 20 },
      setFilters: (filtersOrUpdater) => set((state) => ({ 
        filters: typeof filtersOrUpdater === 'function' 
          ? (filtersOrUpdater as (prev: DashboardFilters) => DashboardFilters)(state.filters)
          : filtersOrUpdater 
      })),
      clearFilters: () => set({ filters: { page: 1, limit: 20 } }),
      setPage: (page) => set((state) => ({ filters: { ...state.filters, page } })),
      setLimit: (limit) => set((state) => ({ filters: { ...state.filters, limit, page: 1 } })),
    }),
    {
      name: 'dashboard-filters',
    }
  )
);
