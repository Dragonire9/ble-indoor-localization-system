'use client';

import { DataTableFacetedFilter, type FacetedFilterOption } from '@/components/data-table/data-table-faceted-filter';
import { Input } from '@/components/ui/input';
import { useBeaconFilterCounts } from '@/hooks/use-beacon-filter-counts';
import { Building2, Search, Wifi, WifiOff } from 'lucide-react';
import * as React from 'react';

export interface BeaconFiltersUnifiedProps {
  sectorId?: string; // Comma-separated values
  connectionState?: string; // Comma-separated values (previously 'ONLINE'|'OFFLINE')
  searchValue?: string;
  onFiltersChange: (filters: {
    sectorId?: string;
    connectionState?: string;
    searchValue?: string;
    page?: number;
  }) => void;
  sectors?: Array<{ sectorId: string; name: string }>;
}

export function BeaconFiltersUnified({
  sectorId,
  connectionState,
  searchValue = '',
  onFiltersChange,
  sectors = [],
}: BeaconFiltersUnifiedProps) {
  // Fetch filter counts from backend with dynamic cross-filtering
  const { data: filterCounts, isLoading: isLoadingCounts } =
    useBeaconFilterCounts({
      sectorId,
      connectionState,
    });

  const [searchInput, setSearchInput] = React.useState(searchValue);
  const prevSearchInputRef = React.useRef(searchValue);

  // Debounce search input - only call onFiltersChange if value actually changed
  React.useEffect(() => {
    if (searchInput === prevSearchInputRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      if (searchInput !== prevSearchInputRef.current) {
        prevSearchInputRef.current = searchInput;
        onFiltersChange({ searchValue: searchInput || undefined, page: 1 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, onFiltersChange]);

  // Sync searchInput with searchValue prop (only when prop changes externally)
  React.useEffect(() => {
    if (searchValue !== prevSearchInputRef.current) {
      setSearchInput(searchValue);
      prevSearchInputRef.current = searchValue;
    }
  }, [searchValue]);

  // Prepare sector filter options
  const sectorOptions: FacetedFilterOption[] = React.useMemo(() => {
    return sectors.map((sector) => ({
      label: sector.name,
      value: sector.sectorId,
      icon: Building2,
    }));
  }, [sectors]);

  // Prepare connection state filter options
  const connectionStateOptions: FacetedFilterOption[] = React.useMemo(() => {
    return [
      {
        label: 'Online',
        value: 'ONLINE',
        icon: Wifi,
      },
      {
        label: 'Offline',
        value: 'OFFLINE',
        icon: WifiOff,
      },
    ];
  }, []);

  // Get selected values for faceted filters (split comma-separated string)
  const selectedSectors = React.useMemo(() => {
    return sectorId ? sectorId.split(',') : [];
  }, [sectorId]);

  const selectedConnectionStates = React.useMemo(() => {
    return connectionState ? connectionState.split(',') : [];
  }, [connectionState]);

  // Handle sector filter change
  const handleSectorChange = (values: string[]) => {
    onFiltersChange({
      sectorId: values.length > 0 ? values.join(',') : undefined,
      page: 1,
    });
  };

  // Handle connection state filter change
  const handleConnectionStateChange = (values: string[]) => {
    onFiltersChange({
      connectionState: values.length > 0 ? values.join(',') : undefined,
      page: 1,
    });
  };

  // Use filter counts from backend (total counts, not filtered)
  const sectorCounts = React.useMemo(() => {
    return filterCounts?.sectors || {};
  }, [filterCounts]);

  const connectionStateCounts = React.useMemo(() => {
    return filterCounts?.connectionStates || { ONLINE: 0, OFFLINE: 0 };
  }, [filterCounts]);

  // Update options with counts
  const sectorOptionsWithCounts = React.useMemo(() => {
    return sectorOptions.map((option) => ({
      ...option,
      count: sectorCounts[option.value] ?? 0,
    }));
  }, [sectorOptions, sectorCounts]);

  const connectionStateOptionsWithCounts = React.useMemo(() => {
    return connectionStateOptions.map((option) => ({
      ...option,
      count: connectionStateCounts[option.value] ?? 0,
    }));
  }, [connectionStateOptions, connectionStateCounts]);

  return (
    <div className="flex flex-1 items-center gap-2">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter beacons..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-8 h-8"
        />
      </div>
      <DataTableFacetedFilter
        title="Sector"
        options={sectorOptionsWithCounts}
        selectedValues={selectedSectors}
        onSelectedChange={handleSectorChange}
        isLoading={isLoadingCounts}
      />
      <DataTableFacetedFilter
        title="Status"
        options={connectionStateOptionsWithCounts}
        selectedValues={selectedConnectionStates}
        onSelectedChange={handleConnectionStateChange}
        isLoading={isLoadingCounts}
      />
    </div>
  );
}
