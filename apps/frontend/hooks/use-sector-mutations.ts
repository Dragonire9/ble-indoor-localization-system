'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';
import { endpoints } from '@/lib/api/endpoints';
import { toast } from 'sonner';
import type { CreateSectorInput, UpdateSectorInput } from '@/types/forms';
import type { Sector } from '@/types/sector';

export function useCreateSector() {
  const queryClient = useQueryClient();

  return useMutation<Sector, AxiosError, CreateSectorInput>({
    mutationFn: async (data) => {
      const response = await apiClient.post(endpoints.sectors.create, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sectors.all });
      toast.success('Sector created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create sector');
    },
  });
}

export function useUpdateSector() {
  const queryClient = useQueryClient();

  return useMutation<Sector, AxiosError, { sectorId: string; data: UpdateSectorInput }>({
    mutationFn: async ({ sectorId, data }) => {
      const response = await apiClient.put(endpoints.sectors.update(sectorId), data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sectors.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.sectors.detail(variables.sectorId) });
      toast.success('Sector updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update sector');
    },
  });
}

export function useDeleteSector() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, string>({
    mutationFn: async (sectorId) => {
      await apiClient.delete(endpoints.sectors.delete(sectorId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sectors.all });
      toast.success('Sector deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to delete sector');
    },
  });
}
