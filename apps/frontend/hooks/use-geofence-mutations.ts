'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';
import { endpoints } from '@/lib/api/endpoints';
import { toast } from 'sonner';
import type { CreateGeofenceInput, UpdateGeofenceInput } from '@/types/forms';
import type { Geofence } from '@/types/geofence';

export function useCreateGeofence() {
  const queryClient = useQueryClient();

  return useMutation<Geofence, AxiosError, CreateGeofenceInput>({
    mutationFn: async (data) => {
      const response = await apiClient.post(endpoints.geofences.create, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.geofences.all });
      toast.success('Geofence created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create geofence');
    },
  });
}

export function useUpdateGeofence() {
  const queryClient = useQueryClient();

  return useMutation<Geofence, AxiosError, { geofenceId: string; data: UpdateGeofenceInput }>({
    mutationFn: async ({ geofenceId, data }) => {
      const response = await apiClient.put(endpoints.geofences.update(geofenceId), data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.geofences.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.geofences.detail(variables.geofenceId) });
      toast.success('Geofence updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update geofence');
    },
  });
}

export function useDeleteGeofence() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, string>({
    mutationFn: async (geofenceId) => {
      await apiClient.delete(endpoints.geofences.delete(geofenceId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.geofences.all });
      toast.success('Geofence deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to delete geofence');
    },
  });
}
