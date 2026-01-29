'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/websocket';
import { queryKeys } from '@/lib/api/query-keys';
import { type Geofence } from '@/types/geofence';

export function useGeofenceWebSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    const handleGeofenceUpdate = (event: { type: string; data: Geofence }) => {
      queryClient.setQueriesData<Geofence[]>(
        { queryKey: queryKeys.geofences.all },
        (old) => {
          if (!old) return old;
          return old.map((geofence) =>
            geofence.id === event.data.id ? event.data : geofence
          );
        }
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.geofences.all });
    };

    const handleGeofenceCreate = (event: { type: string; data: Geofence }) => {
      queryClient.setQueriesData<Geofence[]>(
        { queryKey: queryKeys.geofences.all },
        (old) => (old ? [...old, event.data] : [event.data])
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.geofences.all });
    };

    const handleGeofenceDelete = (event: { type: string; data: { geofenceId: string } }) => {
      queryClient.setQueriesData<Geofence[]>(
        { queryKey: queryKeys.geofences.all },
        (old) => old?.filter((geofence) => geofence.id !== event.data.geofenceId) || []
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.geofences.all });
    };

    socket.on('geofence:update', handleGeofenceUpdate);
    socket.on('geofence:create', handleGeofenceCreate);
    socket.on('geofence:delete', handleGeofenceDelete);

    return () => {
      socket.off('geofence:update', handleGeofenceUpdate);
      socket.off('geofence:create', handleGeofenceCreate);
      socket.off('geofence:delete', handleGeofenceDelete);
    };
  }, [queryClient]);
}
