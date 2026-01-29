'use client';

import { use } from 'react';
import { useSector } from '@/hooks/use-sector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Radio, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function SectorDetailPage({
  params,
}: {
  params: Promise<{ sectorId: string }>;
}) {
  const resolvedParams = use(params);
  const { data: sector, isLoading } = useSector(resolvedParams.sectorId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!sector) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Sector not found</h2>
          <p className="text-muted-foreground mt-2">The sector you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link href="/sectors">Back to Sectors</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/sectors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{sector.name}</h1>
          <p className="text-muted-foreground">{sector.sectorId}</p>
        </div>
      </div>

      {sector.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{sector.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Beacons</CardTitle>
              <Badge variant="outline">
                <Radio className="mr-1 h-3 w-3" />
                {sector.beacons.length}
              </Badge>
            </div>
            <CardDescription>Beacons associated with this sector</CardDescription>
          </CardHeader>
          <CardContent>
            {sector.beacons.length > 0 ? (
              <div className="space-y-2">
                {sector.beacons.slice(0, 5).map((beacon) => (
                  <div
                    key={beacon.id}
                    className="flex items-center justify-between rounded border p-2 text-sm"
                  >
                    <span className="font-medium">{beacon.beaconId}</span>
                    <Badge
                      variant={beacon.connectionState === 'ONLINE' ? 'default' : 'destructive'}
                    >
                      {beacon.connectionState}
                    </Badge>
                  </div>
                ))}
                {sector.beacons.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{sector.beacons.length - 5} more beacons
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No beacons in this sector</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Geofences</CardTitle>
              <Badge variant="outline">
                <MapPin className="mr-1 h-3 w-3" />
                {sector.geofences.length}
              </Badge>
            </div>
            <CardDescription>Geofences associated with this sector</CardDescription>
          </CardHeader>
          <CardContent>
            {sector.geofences.length > 0 ? (
              <div className="space-y-2">
                {sector.geofences.slice(0, 5).map((geofence) => (
                  <div
                    key={geofence.id}
                    className="flex items-center justify-between rounded border p-2 text-sm"
                  >
                    <span className="font-medium">
                      {geofence.name || `Geofence ${geofence.id.slice(-6)}`}
                    </span>
                    <Badge variant="outline">{geofence.coordinates.length} points</Badge>
                  </div>
                ))}
                {sector.geofences.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{sector.geofences.length - 5} more geofences
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No geofences in this sector</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
