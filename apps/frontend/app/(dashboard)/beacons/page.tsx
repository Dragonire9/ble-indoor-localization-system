'use client';

import { BeaconDialog } from '@/components/beacons/beacon-dialog';
import { BeaconFiltersUnified } from '@/components/beacons/beacon-filters-unified';
import { BeaconList } from '@/components/beacons/beacon-list';
import { BeaconTableList } from '@/components/beacons/beacon-table-list';
import { DeleteBeaconDialog } from '@/components/beacons/delete-beacon-dialog';
import { Button } from '@/components/ui/button';
import { ViewToggle } from '@/components/view-toggle';
import { useCreateBeacon, useDeleteBeacon, useUpdateBeacon } from '@/hooks/use-beacon-mutations';
import { useBeaconWebSocket } from '@/hooks/use-beacon-websocket';
import { useBeacons } from '@/hooks/use-beacons';
import { useSectors } from '@/hooks/use-sectors';
import { useDashboardStore } from '@/stores/dashboard-store';
import { usePreferencesStore } from '@/stores/preferences-store';
import type { CreateBeaconInput, UpdateBeaconInput } from '@/types/forms';
import { Plus } from 'lucide-react';
import { useMemo, useState, useCallback } from 'react';
import * as React from 'react';

export default function BeaconsPage() {
  const { filters, setFilters } = useDashboardStore();
  const { preferences, setViewMode } = usePreferencesStore();
  const { data: beaconsResponse, isLoading, error, isError } = useBeacons(filters);
  const { data: sectorsResponse } = useSectors();

  const allBeacons = beaconsResponse?.data || [];
  const beaconsPagination = beaconsResponse?.pagination;
  const sectors = sectorsResponse?.data || [];

  // Apply client-side search filtering for both views
  const beacons = React.useMemo(() => {
    if (!filters.searchValue) return allBeacons;
    const searchLower = filters.searchValue.toLowerCase();
    return allBeacons.filter((beacon) => {
      return (
        beacon.beaconId.toLowerCase().includes(searchLower) ||
        beacon.sector?.name.toLowerCase().includes(searchLower) ||
        beacon.connectionState.toLowerCase().includes(searchLower) ||
        beacon.powerState.toLowerCase().includes(searchLower)
      );
    });
  }, [allBeacons, filters.searchValue]);
  const createBeacon = useCreateBeacon();
  const updateBeacon = useUpdateBeacon();
  const deleteBeacon = useDeleteBeacon();

  // Set up WebSocket for real-time updates
  useBeaconWebSocket();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBeacon, setEditingBeacon] = useState<string | null>(null);
  const [deletingBeacon, setDeletingBeacon] = useState<string | null>(null);

  // View mode state (per-page, defaulting to preferences)
  const [viewMode, setViewModeLocal] = useState<'list' | 'grid'>(preferences.viewMode);
  const handleViewModeChange = (mode: 'list' | 'grid') => {
    setViewModeLocal(mode);
    setViewMode(mode);
  };

  // Sorting state
  const [sorting, setSorting] = useState<{ column: string | null; direction: 'asc' | 'desc' | null }>({
    column: null,
    direction: null,
  });

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'beaconId',
    'sector',
    'connectionState',
    'powerState',
    'battery',
    'rssi',
    'lastSeenAt',
    'actions',
  ]);

  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setVisibleColumns((prev) => {
      if (visible) {
        return [...prev, columnId].filter((id, index, arr) => arr.indexOf(id) === index);
      }
      return prev.filter((id) => id !== columnId);
    });
  };

  // Latest telemetry map for table view
  const latestTelemetryMap = useMemo(() => {
    // This would come from a hook or prop - for now, empty
    return {} as Record<string, { batteryLevel: number | null; rssi: number | null }>;
  }, []);

  const handleCreate = () => {
    setEditingBeacon(null);
    setDialogOpen(true);
  };

  const handleEdit = (beaconId: string) => {
    setEditingBeacon(beaconId);
    setDialogOpen(true);
  };

  const handleSubmit = (data: CreateBeaconInput | UpdateBeaconInput) => {
    if (editingBeacon) {
      updateBeacon.mutate(
        { beaconId: editingBeacon, data: data as UpdateBeaconInput },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setEditingBeacon(null);
          },
        }
      );
    } else {
      createBeacon.mutate(data as CreateBeaconInput, {
        onSuccess: () => {
          setDialogOpen(false);
        },
      });
    }
  };

  const handleDelete = (beaconId: string) => {
    setDeletingBeacon(beaconId);
  };

  const confirmDelete = () => {
    if (deletingBeacon) {
      deleteBeacon.mutate(deletingBeacon, {
        onSuccess: () => {
          setDeletingBeacon(null);
        },
      });
    }
  };

  const editingBeaconData = editingBeacon
    ? beacons?.find((b) => b.beaconId === editingBeacon)
    : undefined;

  // Memoize the filter change handler to prevent infinite loops
  // Use functional update to avoid depending on filters
  const handleFiltersChange = useCallback((newFilters: { sectorId?: string; connectionState?: 'ONLINE' | 'OFFLINE'; searchValue?: string; page?: number }) => {
    setFilters((currentFilters) => ({ ...currentFilters, ...newFilters }));
  }, [setFilters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Beacons</h1>
          <p className="text-muted-foreground">Manage your BLE beacon devices</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Beacon
          </Button>
        </div>
      </div>

      <BeaconFiltersUnified
        sectorId={filters.sectorId}
        connectionState={filters.connectionState}
        searchValue={filters.searchValue}
        onFiltersChange={handleFiltersChange}
        sectors={sectors.map((s) => ({ sectorId: s.sectorId, name: s.name }))}
      />

      {isError && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          <p className="font-semibold">Error loading beacons</p>
          <p className="text-sm">{error?.message || 'Unknown error occurred'}</p>
          <pre className="mt-2 text-xs">{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}

      {viewMode === 'grid' ? (
        <BeaconList
          beacons={beacons}
          latestTelemetryMap={latestTelemetryMap}
          isLoading={isLoading}
          pagination={beaconsPagination}
          onPageChange={(page) => setFilters({ ...filters, page })}
        />
      ) : (
        <BeaconTableList
          beacons={beacons}
          latestTelemetryMap={latestTelemetryMap}
          isLoading={isLoading}
          pagination={beaconsPagination}
          onPageChange={(page) => setFilters({ ...filters, page })}
          onLimitChange={(limit) => setFilters({ ...filters, limit, page: 1 })}
          onEdit={handleEdit}
          onDelete={handleDelete}
          sorting={sorting}
          onSort={(column, direction) => setSorting({ column, direction })}
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
        />
      )}

      <BeaconDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sectors={sectors || []}
        beacon={editingBeaconData}
        onSubmit={handleSubmit}
        isLoading={createBeacon.isPending || updateBeacon.isPending}
      />

      {deletingBeacon && (
        <DeleteBeaconDialog
          open={!!deletingBeacon}
          onOpenChange={(open) => !open && setDeletingBeacon(null)}
          beaconId={deletingBeacon}
          onConfirm={confirmDelete}
          isLoading={deleteBeacon.isPending}
        />
      )}
    </div>
  );
}
