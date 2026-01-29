'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatShortDate } from '@/lib/date-utils';
import { type Beacon } from '@/types/beacon';
import { Battery, Wifi, WifiOff } from 'lucide-react';

export interface BeaconCardProps {
  beacon: Beacon;
  latestTelemetry?: {
    batteryLevel: number | null;
    rssi: number | null;
  };
}

export function BeaconCard({ beacon, latestTelemetry }: BeaconCardProps) {
  const isOnline = beacon.connectionState === 'ONLINE';
  const isLowBattery =
    beacon.powerState === 'LOW_BATTERY' ||
    (latestTelemetry?.batteryLevel && latestTelemetry.batteryLevel < 20);

  return (
    <Card
      className={cn(
        'transition-colors',
        !isOnline && 'border-destructive/50 bg-muted/50',
        isLowBattery && 'border-yellow-500/50'
      )}
      role="listitem"
      aria-label={`Beacon ${beacon.beaconId}, ${isOnline ? 'online' : 'offline'}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{beacon.beaconId}</CardTitle>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Badge variant="default" className="bg-green-500">
                <Wifi className="mr-1 h-3 w-3" />
                Online
              </Badge>
            ) : (
              <Badge variant="destructive">
                <WifiOff className="mr-1 h-3 w-3" />
                Offline
              </Badge>
            )}
            {isLowBattery && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                <Battery className="mr-1 h-3 w-3" />
                Low Battery
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>{beacon.sector.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Power State:</span>
            <span className="font-medium">{beacon.powerState}</span>
          </div>
          {latestTelemetry?.batteryLevel !== null && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Battery:</span>
              <span className="font-medium">{latestTelemetry?.batteryLevel ?? "-"}%</span>
            </div>
          )}
          {latestTelemetry?.rssi !== null && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">RSSI:</span>
              <span className="font-medium">{latestTelemetry?.rssi ?? "-"} dBm</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Last Seen:</span>
            <span className="font-medium">
              {formatShortDate(beacon.lastSeenAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
