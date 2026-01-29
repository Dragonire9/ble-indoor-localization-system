'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';
import { endpoints } from '@/lib/api/endpoints';
import { toast } from 'sonner';
import type { CreateBeaconInput, UpdateBeaconInput } from '@/types/forms';
import type { Beacon } from '@/types/beacon';

export function useCreateBeacon() {
  const queryClient = useQueryClient();

  return useMutation<Beacon, AxiosError, CreateBeaconInput>({
    mutationFn: async (data) => {
      const response = await apiClient.post(endpoints.beacons.create, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.beacons.all });
      toast.success('Beacon created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create beacon');
    },
  });
}

export function useUpdateBeacon() {
  const queryClient = useQueryClient();

  return useMutation<Beacon, AxiosError, { beaconId: string; data: UpdateBeaconInput }>({
    mutationFn: async ({ beaconId, data }) => {
      const response = await apiClient.put(endpoints.beacons.update(beaconId), data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.beacons.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.beacons.detail(variables.beaconId) });
      toast.success('Beacon updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update beacon');
    },
  });
}

export function useDeleteBeacon() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, string>({
    mutationFn: async (beaconId) => {
      await apiClient.delete(endpoints.beacons.delete(beaconId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.beacons.all });
      toast.success('Beacon deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to delete beacon');
    },
  });
}
