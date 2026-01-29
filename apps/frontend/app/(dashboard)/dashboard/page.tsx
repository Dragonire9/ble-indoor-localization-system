'use client';

import { DashboardOverviewCards, type OverviewStat } from '@/components/dashboard/overview-cards';
import { Button } from '@/components/ui/button';
import { useBeaconWebSocket } from '@/hooks/use-beacon-websocket';
import { useBeacons } from '@/hooks/use-beacons';
import { useGeofences } from '@/hooks/use-geofences';
import { useSectors } from '@/hooks/use-sectors';
import { useCreateBeacon } from '@/hooks/use-beacon-mutations';
import { BeaconDialog } from '@/components/beacons/beacon-dialog';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { CreateBeaconInput } from '@/types/forms';

export default function DashboardPage() {
  // Fetch core entities for high-level stats.
  const { data: beaconRes, isLoading: isLoadingBeacons } = useBeacons({
    page: 1,
    limit: 100,
  });
  const { data: sectorRes } = useSectors({ page: 1, limit: 100 });
  const { data: geofenceRes } = useGeofences({ page: 1, limit: 100 });

  const beacons = beaconRes?.data ?? [];
  const sectors = sectorRes?.data ?? [];
  const geofences = geofenceRes?.data ?? [];

  const onlineCount = useMemo(
    () => beacons.filter((b) => b.connectionState === 'ONLINE').length,
    [beacons]
  );

  const offlineCount = beacons.length - onlineCount;

  const overviewStats: OverviewStat[] = useMemo(
    () => [
      {
        id: 'active-beacons',
        label: 'Active beacons',
        value: String(onlineCount),
        deltaLabel: '+12.5%',
        delta: 'Online',
        trend: 'up',
        helper: 'Devices that have reported telemetry in the current window.',
      },
      {
        id: 'offline-beacons',
        label: 'Offline beacons',
        value: String(offlineCount),
        deltaLabel: 'Status',
        delta: offlineCount > 0 ? `${offlineCount} to investigate` : 'All healthy',
        trend: offlineCount > 0 ? 'down' : 'up',
        helper: 'Beacons that have not reported recently.',
      },
      {
        id: 'sectors',
        label: 'Sectors',
        value: String(sectors.length),
        helper: 'Logical areas used to group beacons.',
      },
      {
        id: 'geofences',
        label: 'Geofences',
        value: String(geofences.length),
        helper: 'Defined zones for presence and dwell-time analysis.',
      },
    ],
    [onlineCount, offlineCount, sectors.length, geofences.length]
  );

  // Keep websocket updates so counts stay fresh.
  useBeaconWebSocket();

  // Beacon creation dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const createBeacon = useCreateBeacon();

  const handleCreateBeacon = () => {
    setDialogOpen(true);
  };

  const handleSubmit = (data: CreateBeaconInput) => {
    createBeacon.mutate(data, {
      onSuccess: () => {
        setDialogOpen(false);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            High-level view of your BLE beacon fleet and location health.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/geofences">Manage geofences</Link>
          </Button>
          <Button size="sm" onClick={handleCreateBeacon}>
            <Plus className="mr-2 h-4 w-4" />
            Quick create beacon
          </Button>
        </div>
      </div>

      <DashboardOverviewCards stats={overviewStats} />

      <BeaconDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sectors={sectors || []}
        onSubmit={handleSubmit}
        isLoading={createBeacon.isPending}
      />
    </div>
  );
}
