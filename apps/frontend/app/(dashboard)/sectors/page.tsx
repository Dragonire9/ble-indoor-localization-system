'use client';

import { useState } from 'react';
import { useSectors } from '@/hooks/use-sectors';
import { useCreateSector, useUpdateSector, useDeleteSector } from '@/hooks/use-sector-mutations';
import { SectorList } from '@/components/sectors/sector-list';
import { SectorTableList } from '@/components/sectors/sector-table-list';
import { SectorDialog } from '@/components/sectors/sector-dialog';
import { DeleteSectorDialog } from '@/components/sectors/delete-sector-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePreferencesStore } from '@/stores/preferences-store';
import { ViewToggle } from '@/components/view-toggle';
import type { CreateSectorInput, UpdateSectorInput } from '@/types/forms';
import type { Sector } from '@/types/sector';

export default function SectorsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const { preferences, setViewMode } = usePreferencesStore();
  
  const { data: sectorsResponse, isLoading } = useSectors({ page, limit });
  
  const sectors = sectorsResponse?.data || [];
  const sectorsPagination = sectorsResponse?.pagination;
  const createSector = useCreateSector();
  const updateSector = useUpdateSector();
  const deleteSector = useDeleteSector();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<string | null>(null);
  const [deletingSector, setDeletingSector] = useState<Sector | null>(null);
  
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
    'sectorId',
    'name',
    'description',
    'beaconsCount',
    'geofencesCount',
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
    setEditingSector(null);
    setDialogOpen(true);
  };

  const handleEdit = (sectorId: string) => {
    setEditingSector(sectorId);
    setDialogOpen(true);
  };

  const handleSubmit = (data: CreateSectorInput | UpdateSectorInput) => {
    if (editingSector) {
      updateSector.mutate(
        { sectorId: editingSector, data: data as UpdateSectorInput },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setEditingSector(null);
          },
        }
      );
    } else {
      createSector.mutate(data as CreateSectorInput, {
        onSuccess: () => {
          setDialogOpen(false);
        },
      });
    }
  };

  const handleDelete = (sectorId: string) => {
    const sector = sectors?.find((s) => s.sectorId === sectorId);
    if (sector) {
      setDeletingSector(sector);
    }
  };

  const confirmDelete = () => {
    if (deletingSector) {
      deleteSector.mutate(deletingSector.sectorId, {
        onSuccess: () => {
          setDeletingSector(null);
        },
      });
    }
  };

  const editingSectorData = editingSector
    ? sectors?.find((s) => s.sectorId === editingSector)
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sectors</h1>
          <p className="text-muted-foreground">Manage sectors for organizing beacons and geofences</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Sector
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <SectorList
          sectors={sectors}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          pagination={sectorsPagination}
          onPageChange={setPage}
        />
      ) : (
        <SectorTableList
          sectors={sectors}
          isLoading={isLoading}
          pagination={sectorsPagination}
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

      <SectorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sector={editingSectorData}
        onSubmit={handleSubmit}
        isLoading={createSector.isPending || updateSector.isPending}
      />

      {deletingSector && (
        <DeleteSectorDialog
          open={!!deletingSector}
          onOpenChange={(open) => !open && setDeletingSector(null)}
          sector={deletingSector}
          onConfirm={confirmDelete}
          isLoading={deleteSector.isPending}
        />
      )}
    </div>
  );
}
