'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';
import { endpoints } from '@/lib/api/endpoints';
import { telemetryListResponseSchema, type BeaconTelemetry } from '@/types/telemetry';
import type { TelemetryFilterInput } from '@/types/forms';

export function useBeaconTelemetry(
  beaconId: string,
  filters?: TelemetryFilterInput
): UseQueryResult<BeaconTelemetry[], AxiosError> {
  return useQuery({
    queryKey: queryKeys.beacons.telemetry(beaconId),
    queryFn: async () => {
      const response = await apiClient.get(endpoints.beacons.telemetry(beaconId), {
        params: filters,
      });
      return telemetryListResponseSchema.parse(response.data);
    },
    enabled: !!beaconId,
  });
}
