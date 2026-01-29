'use client';

import * as React from 'react';
import Link from 'next/link';
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
import { type Sector } from '@/types/sector';
import type { Pagination } from '@/types/pagination';
import { Building2, MoreHorizontal, Edit, Trash2, Eye, Radio, MapPin } from 'lucide-react';

export interface SectorTableListProps {
  sectors: Sector[];
  isLoading?: boolean;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onEdit?: (sectorId: string) => void;
  onDelete?: (sectorId: string) => void;
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

const defaultColumns: ColumnDef<Sector>[] = [
  {
    id: 'sectorId',
    header: 'Sector ID',
    accessorKey: 'sectorId',
    enableSorting: true,
    cell: ({ row }) => (
      <Link
        href={`/sectors/${row.sectorId}`}
        className="font-medium hover:underline"
      >
        {row.sectorId}
      </Link>
    ),
  },
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    enableSorting: true,
  },
  {
    id: 'description',
    header: 'Description',
    accessorKey: 'description',
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.description || '-'}
      </span>
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
    id: 'geofencesCount',
    header: 'Geofences',
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span>{row.geofences.length}</span>
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

export function SectorTableList({
  sectors,
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
}: SectorTableListProps) {
  const columns = React.useMemo<ColumnDef<Sector>[]>(() => {
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
                <DropdownMenuItem asChild>
                  <Link href={`/sectors/${row.sectorId}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(row.sectorId)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(row.sectorId)}
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
    if (!searchValue) return sectors;
    const searchLower = searchValue.toLowerCase();
    return sectors.filter((sector) => {
      return (
        sector.sectorId.toLowerCase().includes(searchLower) ||
        sector.name.toLowerCase().includes(searchLower) ||
        (sector.description?.toLowerCase().includes(searchLower) ?? false)
      );
    });
  }, [sectors, searchValue]);

  return (
    <div className="space-y-4">
      <DataTableToolbar
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder="Filter sectors..."
        facetedFilters={facetedFilters}
        columns={columnVisibility}
        onColumnToggle={onColumnVisibilityChange}
      />
      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        emptyMessage="No sectors found"
        emptyIcon={<Building2 className="h-12 w-12 text-muted-foreground" />}
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
