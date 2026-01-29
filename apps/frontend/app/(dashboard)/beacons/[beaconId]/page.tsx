'use client';

import { use } from 'react';
import { useBeacon } from '@/hooks/use-beacon';
import { useBeaconTelemetry } from '@/hooks/use-beacon-telemetry';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDeleteBeacon } from '@/hooks/use-beacon-mutations';
import { DeleteBeaconDialog } from '@/components/beacons/delete-beacon-dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatShortDate } from '@/lib/date-utils';

export default function BeaconDetailPage({
  params,
}: {
  params: Promise<{ beaconId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: beacon, isLoading } = useBeacon(resolvedParams.beaconId);
  const { data: telemetry } = useBeaconTelemetry(resolvedParams.beaconId, { limit: 10 });
  const deleteBeacon = useDeleteBeacon();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    deleteBeacon.mutate(resolvedParams.beaconId, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        router.push('/beacons');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!beacon) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Beacon not found</h2>
          <p className="text-muted-foreground mt-2">The beacon you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link href="/beacons">Back to Beacons</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isOnline = beacon.connectionState === 'ONLINE';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/beacons">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{beacon.beaconId}</h1>
            <p className="text-muted-foreground">{beacon.sector.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/beacons/${beacon.beaconId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={deleteBeacon.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Current connection and power state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Connection State:</span>
              <Badge variant={isOnline ? 'default' : 'destructive'}>
                {beacon.connectionState}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Power State:</span>
              <Badge
                variant={
                  beacon.powerState === 'LOW_BATTERY'
                    ? 'destructive'
                    : beacon.powerState === 'ON'
                    ? 'default'
                    : 'secondary'
                }
              >
                {beacon.powerState}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Seen:</span>
              <span className="text-sm font-medium">
                {formatShortDate(beacon.lastSeenAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Registered:</span>
              <span className="text-sm font-medium">
                {formatShortDate(beacon.registeredAt)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Beacon settings and metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sector:</span>
              <span className="text-sm font-medium">{beacon.sector.name}</span>
            </div>
            {beacon.geofence && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Geofence:</span>
                <span className="text-sm font-medium">{beacon.geofence.name || 'Unnamed'}</span>
              </div>
            )}
            {beacon.mqttUsername && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">MQTT Username:</span>
                <span className="text-sm font-medium">{beacon.mqttUsername}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {telemetry && telemetry.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Telemetry</CardTitle>
                <CardDescription>Latest telemetry data from this beacon</CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/beacons/${beacon.beaconId}/telemetry`}>
                  View All
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {telemetry.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      {formatShortDate(item.timestamp)}
                    </span>
                    {item.rssi !== null && (
                      <span className="text-muted-foreground">RSSI: {item.rssi} dBm</span>
                    )}
                    {item.batteryLevel !== null && (
                      <span className="text-muted-foreground">
                        Battery: {item.batteryLevel}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <DeleteBeaconDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        beaconId={beacon.beaconId}
        onConfirm={handleDelete}
        isLoading={deleteBeacon.isPending}
      />
    </div>
  );
}
