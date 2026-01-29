'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';
import { endpoints } from '@/lib/api/endpoints';
import { sectorDetailResponseSchema, type Sector } from '@/types/sector';

export function useSector(sectorId: string): UseQueryResult<Sector, AxiosError> {
  return useQuery({
    queryKey: queryKeys.sectors.detail(sectorId),
    queryFn: async () => {
      const response = await apiClient.get(endpoints.sectors.detail(sectorId));
      return sectorDetailResponseSchema.parse(response.data);
    },
    enabled: !!sectorId,
  });
}
