'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';
import { endpoints } from '@/lib/api/endpoints';
import { beaconDetailResponseSchema, type Beacon } from '@/types/beacon';

export function useBeacon(beaconId: string): UseQueryResult<Beacon, AxiosError> {
  return useQuery({
    queryKey: queryKeys.beacons.detail(beaconId),
    queryFn: async () => {
      const response = await apiClient.get(endpoints.beacons.detail(beaconId));
      return beaconDetailResponseSchema.parse(response.data);
    },
    enabled: !!beaconId,
  });
}
