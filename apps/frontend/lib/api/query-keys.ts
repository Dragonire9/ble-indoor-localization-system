export const queryKeys = {
  beacons: {
    all: ['beacons'] as const,
    lists: () => [...queryKeys.beacons.all, 'list'] as const,
    list: (filters?: { sectorId?: string; connectionState?: string; page?: number; limit?: number }) =>
      [...queryKeys.beacons.lists(), filters] as const,
    details: () => [...queryKeys.beacons.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.beacons.details(), id] as const,
    telemetry: (id: string) => [...queryKeys.beacons.detail(id), 'telemetry'] as const,
    filterCounts: () => [...queryKeys.beacons.all, 'filter-counts'] as const,
  },
  geofences: {
    all: ['geofences'] as const,
    lists: () => [...queryKeys.geofences.all, 'list'] as const,
    list: (filters?: { sectorId?: string; beaconId?: string; page?: number; limit?: number }) =>
      [...queryKeys.geofences.lists(), filters] as const,
    details: () => [...queryKeys.geofences.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.geofences.details(), id] as const,
  },
  sectors: {
    all: ['sectors'] as const,
    lists: () => [...queryKeys.sectors.all, 'list'] as const,
    list: (pagination?: { page?: number; limit?: number }) =>
      [...queryKeys.sectors.lists(), pagination] as const,
    details: () => [...queryKeys.sectors.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.sectors.details(), id] as const,
  },
} as const;
