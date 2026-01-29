'use client';

import * as React from 'react';
import { DataTable, type ColumnDef } from '@/components/data-table/data-table';
import { DataTableToolbar, type DataTableToolbarProps } from '@/components/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatShortDate } from '@/lib/date-utils';
import { type Geofence } from '@/types/geofence';
import type { Pagination } from '@/types/pagination';
import { MapPin, MoreHorizontal, Edit, Trash2, Radio } from 'lucide-react';

export interface GeofenceTableListProps {
  geofences: Geofence[];
  isLoading?: boolean;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onEdit?: (geofenceId: string) => void;
  onDelete?: (geofenceId: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  sorting?: {
    column: string | null;
    direction: 'asc' | 'desc' | null;
  };
  onSort?: (column: string, direction: 'asc' | 'desc' | null) => void;
  visibleColumns?: string[];
  onColumnVisibilityChange?: (columnId: string, visible: boolean) => void;
  facetedFilters?: DataTableToolbarProps['facetedFilters'];
}

const defaultColumns: ColumnDef<Geofence>[] = [
  {
    id: 'id',
    header: 'Geofence ID',
    accessorKey: 'id',
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-medium">
        {row.name || `Geofence ${row.id.slice(-6)}`}
      </span>
    ),
  },
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.name || '-'}
      </span>
    ),
  },
  {
    id: 'sector',
    header: 'Sector',
    accessorFn: (row) => row.sector.name,
    enableSorting: true,
  },
  {
    id: 'coordinatesCount',
    header: 'Points',
    enableSorting: false,
    cell: ({ row }) => (
      <Badge variant="outline">
        <MapPin className="mr-1 h-3 w-3" />
        {row.coordinates.length}
      </Badge>
    ),
  },
  {
    id: 'beaconsCount',
    header: 'Beacons',
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Radio className="h-4 w-4 text-muted-foreground" />
        <span>{row.beacons.length}</span>
      </div>
    ),
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessorKey: 'createdAt',
    enableSorting: true,
    cell: ({ row }) => formatShortDate(row.createdAt),
  },
  {
    id: 'actions',
    header: '',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      // Actions will be handled by parent component
      return null;
    },
  },
];

export function GeofenceTableList({
  geofences,
  isLoading,
  pagination,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
  searchValue,
  onSearchChange,
  sorting,
  onSort,
  visibleColumns,
  onColumnVisibilityChange,
  facetedFilters,
}: GeofenceTableListProps) {
  const columns = React.useMemo<ColumnDef<Geofence>[]>(() => {
    return defaultColumns.map((col) => {
      if (col.id === 'actions') {
        return {
          ...col,
          cell: ({ row }) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(row.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(row.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        };
      }
      return col;
    });
  }, [onEdit, onDelete]);

  const columnVisibility = React.useMemo(() => {
    return columns.map((col) => ({
      id: col.id,
      label: typeof col.header === 'string' ? col.header : col.id,
      visible: visibleColumns?.includes(col.id) ?? true,
    }));
  }, [columns, visibleColumns]);

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!searchValue) return geofences;
    const searchLower = searchValue.toLowerCase();
    return geofences.filter((geofence) => {
      return (
        geofence.id.toLowerCase().includes(searchLower) ||
        (geofence.name?.toLowerCase().includes(searchLower) ?? false) ||
        geofence.sector.name.toLowerCase().includes(searchLower)
      );
    });
  }, [geofences, searchValue]);

  return (
    <div className="space-y-4">
      <DataTableToolbar
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder="Filter geofences..."
        facetedFilters={facetedFilters}
        columns={columnVisibility}
        onColumnToggle={onColumnVisibilityChange}
      />
      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        emptyMessage="No geofences found"
        emptyIcon={<MapPin className="h-12 w-12 text-muted-foreground" />}
        sorting={sorting}
        onSort={onSort}
        visibleColumns={visibleColumns}
        onColumnVisibilityChange={onColumnVisibilityChange}
        getRowId={(row) => row.id}
      />
      {pagination && (
        <DataTablePagination
          pagination={pagination}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
}
