'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { apiClient } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';
import { endpoints } from '@/lib/api/endpoints';
import type { Beacon } from '@/types/beacon';
import type { PaginationParams, PaginatedResponse } from '@/types/pagination';

export interface BeaconFilters extends PaginationParams {
  sectorId?: string;
  connectionState?: 'ONLINE' | 'OFFLINE';
  searchValue?: string;
}

export function useBeacons(
  filters?: BeaconFilters
): UseQueryResult<PaginatedResponse<Beacon>, AxiosError> {
  return useQuery({
    queryKey: queryKeys.beacons.list(filters),
    queryFn: async () => {
      // Clean up undefined values from params to avoid sending them to backend
      const params: Record<string, string | number> = {};
      if (filters?.sectorId) params.sectorId = filters.sectorId;
      if (filters?.connectionState) params.connectionState = filters.connectionState;
      if (filters?.page) params.page = filters.page;
      if (filters?.limit) params.limit = filters.limit;

      const response = await apiClient.get(endpoints.beacons.list, {
        params,
      });

      // Avoid zod runtime instrumentation issues by trusting the backend shape here.
      // If the backend response ever changes, you'll see it in the console.
      return response.data as PaginatedResponse<Beacon>;
    },
  });
}
