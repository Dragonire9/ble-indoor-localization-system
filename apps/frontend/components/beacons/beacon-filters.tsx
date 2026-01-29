'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export interface BeaconFiltersProps {
  sectorId?: string;
  connectionState?: 'ONLINE' | 'OFFLINE';
  onFiltersChange: (filters: { sectorId?: string; connectionState?: 'ONLINE' | 'OFFLINE' }) => void;
  sectors?: Array<{ sectorId: string; name: string }>;
}

export function BeaconFilters({ sectorId, connectionState, onFiltersChange, sectors }: BeaconFiltersProps) {
  const [localSectorId, setLocalSectorId] = useState<'all' | string>(sectorId || 'all');
  const [localConnectionState, setLocalConnectionState] = useState<'ONLINE' | 'OFFLINE' | 'all'>(
    connectionState || 'all'
  );

  // Sync local state with props when they change externally
  useEffect(() => {
    setLocalSectorId(sectorId || 'all');
  }, [sectorId]);

  useEffect(() => {
    setLocalConnectionState(connectionState || 'all');
  }, [connectionState]);

  const handleApply = () => {
    onFiltersChange({
      sectorId: localSectorId === 'all' ? undefined : localSectorId,
      connectionState: localConnectionState === 'all' ? undefined : localConnectionState,
      page: 1, // Reset to first page when filters change
    });
  };

  const handleReset = () => {
    setLocalSectorId('all');
    setLocalConnectionState('all');
    onFiltersChange({ page: 1, limit: 20 }); // Reset filters and pagination
  };

  return (
    <div 
      className="flex flex-wrap items-end gap-4 rounded-lg border bg-card p-4"
      role="search"
      aria-label="Beacon filters"
    >
      <div className="space-y-2">
        <Label htmlFor="sector-filter">Sector</Label>
        <Select value={localSectorId} onValueChange={(value) => setLocalSectorId(value as 'all' | string)}>
          <SelectTrigger id="sector-filter" className="w-full sm:w-[200px]">
            <SelectValue placeholder="All sectors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sectors</SelectItem>
            {sectors?.map((sector) => (
              <SelectItem key={sector.sectorId} value={sector.sectorId}>
                {sector.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="connection-filter">Connection State</Label>
        <Select
          value={localConnectionState}
          onValueChange={(value) => setLocalConnectionState(value as 'ONLINE' | 'OFFLINE' | 'all')}
        >
          <SelectTrigger id="connection-filter" className="w-full sm:w-[200px]">
            <SelectValue placeholder="All states" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All states</SelectItem>
            <SelectItem value="ONLINE">Online</SelectItem>
            <SelectItem value="OFFLINE">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Button 
          onClick={handleApply} 
          variant="default"
          aria-label="Apply selected filters"
        >
          Apply Filters
        </Button>
        <Button 
          onClick={handleReset} 
          variant="outline"
          aria-label="Reset filters to default"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
