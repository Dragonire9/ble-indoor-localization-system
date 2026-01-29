import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPreferences {
  // View preferences
  viewMode: 'grid' | 'list';
  itemsPerPage: number;
  
  // Filter preferences (persisted across sessions)
  defaultFilters: {
    sectorId?: string;
    connectionState?: 'ONLINE' | 'OFFLINE';
  };
  
  // UI preferences
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
}

interface PreferencesStore {
  preferences: UserPreferences;
  setViewMode: (mode: 'grid' | 'list') => void;
  setItemsPerPage: (count: number) => void;
  setDefaultFilters: (filters: UserPreferences['defaultFilters']) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  viewMode: 'grid',
  itemsPerPage: 20,
  defaultFilters: {},
  sidebarCollapsed: false,
  theme: 'system',
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      setViewMode: (mode) =>
        set((state) => ({
          preferences: { ...state.preferences, viewMode: mode },
        })),
      setItemsPerPage: (count) =>
        set((state) => ({
          preferences: { ...state.preferences, itemsPerPage: count },
        })),
      setDefaultFilters: (filters) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            defaultFilters: filters,
          },
        })),
      setSidebarCollapsed: (collapsed) =>
        set((state) => ({
          preferences: { ...state.preferences, sidebarCollapsed: collapsed },
        })),
      setTheme: (theme) =>
        set((state) => ({
          preferences: { ...state.preferences, theme },
        })),
      resetPreferences: () =>
        set({
          preferences: defaultPreferences,
        }),
    }),
    {
      name: 'user-preferences',
      // Only persist certain preferences, not all
      partialize: (state) => ({
        preferences: {
          viewMode: state.preferences.viewMode,
          itemsPerPage: state.preferences.itemsPerPage,
          defaultFilters: state.preferences.defaultFilters,
          sidebarCollapsed: state.preferences.sidebarCollapsed,
          theme: state.preferences.theme,
        },
      }),
    }
  )
);
