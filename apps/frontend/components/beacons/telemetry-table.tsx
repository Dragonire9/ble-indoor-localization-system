'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { type BeaconTelemetry } from '@/types/telemetry';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/date-utils';

export interface TelemetryTableProps {
  telemetry: BeaconTelemetry[];
  isLoading?: boolean;
}

export function TelemetryTable({ telemetry, isLoading }: TelemetryTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border p-4 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (telemetry.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No telemetry data available
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>RSSI</TableHead>
            <TableHead>Battery</TableHead>
            <TableHead>Power State</TableHead>
            <TableHead>Transmission Power</TableHead>
            <TableHead>Zone Flags</TableHead>
            <TableHead>Role Flags</TableHead>
            <TableHead>Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {telemetry.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {formatDate(item.timestamp)}
              </TableCell>
              <TableCell>{item.rssi !== null ? `${item.rssi} dBm` : '-'}</TableCell>
              <TableCell>
                {item.batteryLevel !== null ? `${item.batteryLevel}%` : '-'}
              </TableCell>
              <TableCell>
                {item.powerState && (
                  <Badge
                    variant={
                      item.powerState === 'LOW_BATTERY'
                        ? 'destructive'
                        : item.powerState === 'ON'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {item.powerState}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {item.transmissionPower !== null ? `${item.transmissionPower} dBm` : '-'}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {item.zoneFlags.length > 0 ? (
                    item.zoneFlags.map((flag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {flag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {item.roleFlags.length > 0 ? (
                    item.roleFlags.map((flag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {flag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {item.message || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
