'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/websocket';
import { queryKeys } from '@/lib/api/query-keys';
import { type Beacon } from '@/types/beacon';
import { type BeaconTelemetry } from '@/types/telemetry';

export function useBeaconWebSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    const handleBeaconUpdate = (event: { type: string; data: Beacon }) => {
      // Update the specific beacon in all relevant queries
      queryClient.setQueriesData<Beacon[]>(
        { queryKey: queryKeys.beacons.all },
        (old) => {
          if (!old) return old;
          return old.map((beacon) =>
            beacon.id === event.data.id ? event.data : beacon
          );
        }
      );
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.beacons.all });
    };

    const handleBeaconCreate = (event: { type: string; data: Beacon }) => {
      // Add new beacon to cache
      queryClient.setQueriesData<Beacon[]>(
        { queryKey: queryKeys.beacons.all },
        (old) => (old ? [...old, event.data] : [event.data])
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.beacons.all });
    };

    const handleBeaconDelete = (event: { type: string; data: { beaconId: string } }) => {
      // Remove beacon from cache
      queryClient.setQueriesData<Beacon[]>(
        { queryKey: queryKeys.beacons.all },
        (old) => old?.filter((beacon) => beacon.beaconId !== event.data.beaconId) || []
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.beacons.all });
    };

    const handleConnectionState = (event: {
      type: string;
      data: { beaconId: string; connectionState: 'ONLINE' | 'OFFLINE'; lastSeenAt: string };
    }) => {
      // Update connection state in cache
      queryClient.setQueriesData<Beacon[]>(
        { queryKey: queryKeys.beacons.all },
        (old) => {
          if (!old) return old;
          return old.map((beacon) =>
            beacon.beaconId === event.data.beaconId
              ? {
                  ...beacon,
                  connectionState: event.data.connectionState,
                  lastSeenAt: event.data.lastSeenAt,
                }
              : beacon
          );
        }
      );
    };

    const handleTelemetryNew = (event: {
      type: string;
      data: BeaconTelemetry & { beaconId: string };
    }) => {
      // Invalidate telemetry queries for this beacon
      queryClient.invalidateQueries({
        queryKey: queryKeys.beacons.telemetry(event.data.beaconId),
      });
      // Also update beacon's last seen timestamp
      queryClient.setQueriesData<Beacon[]>(
        { queryKey: queryKeys.beacons.all },
        (old) => {
          if (!old) return old;
          return old.map((beacon) =>
            beacon.beaconId === event.data.beaconId
              ? {
                  ...beacon,
                  lastSeenAt: event.data.timestamp,
                }
              : beacon
          );
        }
      );
    };

    socket.on('beacon:update', handleBeaconUpdate);
    socket.on('beacon:create', handleBeaconCreate);
    socket.on('beacon:delete', handleBeaconDelete);
    socket.on('connection:state', handleConnectionState);
    socket.on('telemetry:new', handleTelemetryNew);

    return () => {
      socket.off('beacon:update', handleBeaconUpdate);
      socket.off('beacon:create', handleBeaconCreate);
      socket.off('beacon:delete', handleBeaconDelete);
      socket.off('connection:state', handleConnectionState);
      socket.off('telemetry:new', handleTelemetryNew);
    };
  }, [queryClient]);
}
