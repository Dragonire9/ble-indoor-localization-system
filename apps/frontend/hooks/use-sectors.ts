'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { apiClient } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';
import { endpoints } from '@/lib/api/endpoints';
import type { Sector } from '@/types/sector';
import type { PaginationParams, PaginatedResponse } from '@/types/pagination';

export function useSectors(
  pagination?: PaginationParams
): UseQueryResult<PaginatedResponse<Sector>, AxiosError> {
  return useQuery({
    queryKey: queryKeys.sectors.list(pagination),
    queryFn: async () => {
      const response = await apiClient.get(endpoints.sectors.list, {
        params: pagination,
      });

      return response.data as PaginatedResponse<Sector>;
    },
  });
}
