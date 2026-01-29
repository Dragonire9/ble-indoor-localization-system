'use client';

import { useState } from 'react';
import { useGeofences } from '@/hooks/use-geofences';
import { useSectors } from '@/hooks/use-sectors';
import { useCreateGeofence, useUpdateGeofence, useDeleteGeofence } from '@/hooks/use-geofence-mutations';
import { useGeofenceWebSocket } from '@/hooks/use-geofence-websocket';
import { GeofenceList } from '@/components/geofences/geofence-list';
import { GeofenceTableList } from '@/components/geofences/geofence-table-list';
import { GeofenceDialog } from '@/components/geofences/geofence-dialog';
import { DeleteGeofenceDialog } from '@/components/geofences/delete-geofence-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePreferencesStore } from '@/stores/preferences-store';
import { ViewToggle } from '@/components/view-toggle';
import type { CreateGeofenceInput, UpdateGeofenceInput } from '@/types/forms';

export default function GeofencesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const { preferences, setViewMode } = usePreferencesStore();
  
  const { data: geofencesResponse, isLoading } = useGeofences({ page, limit });
  const { data: sectorsResponse } = useSectors({ page: 1, limit: 100 });
  
  const geofences = geofencesResponse?.data || [];
  const geofencesPagination = geofencesResponse?.pagination;
  const sectors = sectorsResponse?.data || [];
  const createGeofence = useCreateGeofence();
  const updateGeofence = useUpdateGeofence();
  const deleteGeofence = useDeleteGeofence();

  // Set up WebSocket for real-time updates
  useGeofenceWebSocket();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGeofence, setEditingGeofence] = useState<string | null>(null);
  const [deletingGeofence, setDeletingGeofence] = useState<string | null>(null);
  
  // View mode state
  const [viewMode, setViewModeLocal] = useState<'list' | 'grid'>(preferences.viewMode);
  const handleViewModeChange = (mode: 'list' | 'grid') => {
    setViewModeLocal(mode);
    setViewMode(mode);
  };
  
  // Search state
  const [searchValue, setSearchValue] = useState('');
  
  // Sorting state
  const [sorting, setSorting] = useState<{ column: string | null; direction: 'asc' | 'desc' | null }>({
    column: null,
    direction: null,
  });
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'id',
    'name',
    'sector',
    'coordinatesCount',
    'beaconsCount',
    'createdAt',
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

  const handleCreate = () => {
    setEditingGeofence(null);
    setDialogOpen(true);
  };

  const handleEdit = (geofenceId: string) => {
    setEditingGeofence(geofenceId);
    setDialogOpen(true);
  };

  const handleView = (geofenceId: string) => {
    // Navigate to geofence detail page if needed
    window.location.href = `/geofences/${geofenceId}`;
  };

  const handleSubmit = (data: CreateGeofenceInput | UpdateGeofenceInput) => {
    if (editingGeofence) {
      updateGeofence.mutate(
        { geofenceId: editingGeofence, data: data as UpdateGeofenceInput },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setEditingGeofence(null);
          },
        }
      );
    } else {
      createGeofence.mutate(data as CreateGeofenceInput, {
        onSuccess: () => {
          setDialogOpen(false);
        },
      });
    }
  };

  const handleDelete = (geofenceId: string) => {
    setDeletingGeofence(geofenceId);
  };

  const confirmDelete = () => {
    if (deletingGeofence) {
      deleteGeofence.mutate(deletingGeofence, {
        onSuccess: () => {
          setDeletingGeofence(null);
        },
      });
    }
  };

  const editingGeofenceData = editingGeofence
    ? geofences?.find((g) => g.id === editingGeofence)
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Geofences</h1>
          <p className="text-muted-foreground">Manage geofence polygons for beacon monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Geofence
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <GeofenceList
          geofences={geofences}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          pagination={geofencesPagination}
          onPageChange={setPage}
        />
      ) : (
        <GeofenceTableList
          geofences={geofences}
          isLoading={isLoading}
          pagination={geofencesPagination}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          sorting={sorting}
          onSort={(column, direction) => setSorting({ column, direction })}
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
        />
      )}

      <GeofenceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sectors={sectors || []}
        geofence={editingGeofenceData}
        onSubmit={handleSubmit}
        isLoading={createGeofence.isPending || updateGeofence.isPending}
      />

      {deletingGeofence && (
        <DeleteGeofenceDialog
          open={!!deletingGeofence}
          onOpenChange={(open) => !open && setDeletingGeofence(null)}
          geofenceId={deletingGeofence}
          onConfirm={confirmDelete}
          isLoading={deleteGeofence.isPending}
        />
      )}
    </div>
  );
}
