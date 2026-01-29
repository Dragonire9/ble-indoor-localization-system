'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { apiClient } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';
import { endpoints } from '@/lib/api/endpoints';
import type { Geofence } from '@/types/geofence';
import type { PaginationParams, PaginatedResponse } from '@/types/pagination';

export interface GeofenceFilters extends PaginationParams {
  sectorId?: string;
  beaconId?: string;
}

export function useGeofences(
  filters?: GeofenceFilters
): UseQueryResult<PaginatedResponse<Geofence>, AxiosError> {
  return useQuery({
    queryKey: queryKeys.geofences.list(filters),
    queryFn: async () => {
      const response = await apiClient.get(endpoints.geofences.list, {
        params: filters,
      });

      return response.data as PaginatedResponse<Geofence>;
    },
  });
}
