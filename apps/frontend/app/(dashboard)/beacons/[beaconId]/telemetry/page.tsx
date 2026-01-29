'use client';

import { use, useState } from 'react';
import { useBeacon } from '@/hooks/use-beacon';
import { useBeaconTelemetry } from '@/hooks/use-beacon-telemetry';
import { TelemetryTable } from '@/components/beacons/telemetry-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { TelemetryFilterInput } from '@/types/forms';

export default function BeaconTelemetryPage({
  params,
}: {
  params: Promise<{ beaconId: string }>;
}) {
  const resolvedParams = use(params);
  const { data: beacon } = useBeacon(resolvedParams.beaconId);
  const [filters, setFilters] = useState<TelemetryFilterInput>({
    limit: 100,
    offset: 0,
  });

  const { data: telemetry, isLoading } = useBeaconTelemetry(resolvedParams.beaconId, filters);

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value ? new Date(value).toISOString() : undefined,
      offset: 0, // Reset pagination when filters change
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/beacons/${resolvedParams.beaconId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Telemetry History</h1>
          <p className="text-muted-foreground">
            {beacon ? `Telemetry data for ${beacon.beaconId}` : 'Loading...'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter telemetry data by date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="datetime-local"
                onChange={(e) => handleDateChange('startDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="datetime-local"
                onChange={(e) => handleDateChange('endDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Telemetry Data</CardTitle>
          <CardDescription>
            {telemetry ? `Showing ${telemetry.length} records` : 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TelemetryTable telemetry={telemetry || []} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
