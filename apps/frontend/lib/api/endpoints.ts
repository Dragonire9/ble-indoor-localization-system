export const endpoints = {
  beacons: {
    list: '/api/beacons',
    detail: (id: string) => `/api/beacons/${id}`,
    create: '/api/beacons',
    update: (id: string) => `/api/beacons/${id}`,
    delete: (id: string) => `/api/beacons/${id}`,
    telemetry: (id: string) => `/api/beacons/${id}/telemetry`,
    filterCounts: '/api/beacons/filter-counts',
  },
  geofences: {
    list: '/api/geofences',
    detail: (id: string) => `/api/geofences/${id}`,
    create: '/api/geofences',
    update: (id: string) => `/api/geofences/${id}`,
    delete: (id: string) => `/api/geofences/${id}`,
  },
  sectors: {
    list: '/api/sectors',
    detail: (id: string) => `/api/sectors/${id}`,
    create: '/api/sectors',
    update: (id: string) => `/api/sectors/${id}`,
    delete: (id: string) => `/api/sectors/${id}`,
  },
} as const;
