'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';
import { endpoints } from '@/lib/api/endpoints';
import { geofenceDetailResponseSchema, type Geofence } from '@/types/geofence';

export function useGeofence(geofenceId: string): UseQueryResult<Geofence, AxiosError> {
  return useQuery({
    queryKey: queryKeys.geofences.detail(geofenceId),
    queryFn: async () => {
      const response = await apiClient.get(endpoints.geofences.detail(geofenceId));
      return geofenceDetailResponseSchema.parse(response.data);
    },
    enabled: !!geofenceId,
  });
}
