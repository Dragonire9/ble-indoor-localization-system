'use client';

import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/api/query-keys';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

export interface BeaconFilterCounts {
  sectors: Record<string, number>;
  connectionStates: Record<string, number>;
}

export function useBeaconFilterCounts(filters?: {
  sectorId?: string;
  connectionState?: string;
}): UseQueryResult<BeaconFilterCounts, AxiosError> {
  return useQuery({
    queryKey: [...queryKeys.beacons.filterCounts(), filters],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.beacons.filterCounts, {
        params: filters,
      });
      return response.data as BeaconFilterCounts;
    },
  });
}
