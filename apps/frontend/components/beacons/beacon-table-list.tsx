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
import { type Beacon } from '@/types/beacon';
import type { Pagination } from '@/types/pagination';
import { Battery, Wifi, WifiOff, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Radio } from 'lucide-react';

export interface BeaconTableListProps {
  beacons: Beacon[];
  latestTelemetryMap?: Record<string, { batteryLevel: number | null; rssi: number | null }>;
  isLoading?: boolean;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onEdit?: (beaconId: string) => void;
  onDelete?: (beaconId: string) => void;
  sorting?: {
    column: string | null;
    direction: 'asc' | 'desc' | null;
  };
  onSort?: (column: string, direction: 'asc' | 'desc' | null) => void;
  visibleColumns?: string[];
  onColumnVisibilityChange?: (columnId: string, visible: boolean) => void;
  facetedFilters?: DataTableToolbarProps['facetedFilters'];
}

const defaultColumns: ColumnDef<Beacon>[] = [
  {
    id: 'beaconId',
    header: 'Beacon ID',
    accessorKey: 'beaconId',
    enableSorting: true,
    cell: ({ row }) => (
      <Link
        href={`/beacons/${row.beaconId}`}
        className="font-medium hover:underline"
      >
        {row.beaconId}
      </Link>
    ),
  },
  {
    id: 'sector',
    header: 'Sector',
    accessorFn: (row) => row.sector.name,
    enableSorting: true,
  },
  {
    id: 'connectionState',
    header: 'Status',
    accessorKey: 'connectionState',
    enableSorting: true,
    cell: ({ row }) => {
      const isOnline = row.connectionState === 'ONLINE';
      return (
        <Badge variant={isOnline ? 'default' : 'destructive'} className={isOnline ? 'bg-green-500' : ''}>
          {isOnline ? (
            <>
              <Wifi className="mr-1 h-3 w-3" />
              Online
            </>
          ) : (
            <>
              <WifiOff className="mr-1 h-3 w-3" />
              Offline
            </>
          )}
        </Badge>
      );
    },
  },
  {
    id: 'powerState',
    header: 'Power State',
    accessorKey: 'powerState',
    enableSorting: true,
    cell: ({ row }) => {
      const isLowBattery = row.powerState === 'LOW_BATTERY';
      return (
        <div className="flex items-center gap-2">
          <span>{row.powerState}</span>
          {isLowBattery && (
            <Battery className="h-4 w-4 text-yellow-600" />
          )}
        </div>
      );
    },
  },
  {
    id: 'battery',
    header: 'Battery',
    enableSorting: false,
    cell: ({ row }) => {
      // This will be populated by the component using latestTelemetryMap
      return <span className="text-muted-foreground">-</span>;
    },
  },
  {
    id: 'rssi',
    header: 'RSSI',
    enableSorting: false,
    cell: ({ row }) => {
      // This will be populated by the component using latestTelemetryMap
      return <span className="text-muted-foreground">-</span>;
    },
  },
  {
    id: 'lastSeenAt',
    header: 'Last Seen',
    accessorKey: 'lastSeenAt',
    enableSorting: true,
    cell: ({ row }) => formatShortDate(row.lastSeenAt),
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

export function BeaconTableList({
  beacons,
  latestTelemetryMap,
  isLoading,
  pagination,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
  sorting,
  onSort,
  visibleColumns,
  onColumnVisibilityChange,
  facetedFilters,
}: BeaconTableListProps) {
  // Enhance columns with telemetry data
  const columns = React.useMemo<ColumnDef<Beacon>[]>(() => {
    return defaultColumns.map((col) => {
      if (col.id === 'battery') {
        return {
          ...col,
          cell: ({ row }) => {
            const telemetry = latestTelemetryMap?.[row.beaconId];
            return telemetry?.batteryLevel !== null && telemetry?.batteryLevel !== undefined
              ? `${telemetry.batteryLevel}%`
              : <span className="text-muted-foreground">-</span>;
          },
        };
      }
      if (col.id === 'rssi') {
        return {
          ...col,
          cell: ({ row }) => {
            const telemetry = latestTelemetryMap?.[row.beaconId];
            return telemetry?.rssi !== null && telemetry?.rssi !== undefined
              ? `${telemetry.rssi} dBm`
              : <span className="text-muted-foreground">-</span>;
          },
        };
      }
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
                  <Link href={`/beacons/${row.beaconId}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(row.beaconId)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(row.beaconId)}
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
  }, [latestTelemetryMap, onEdit, onDelete]);

  const columnVisibility = React.useMemo(() => {
    return columns.map((col) => ({
      id: col.id,
      label: typeof col.header === 'string' ? col.header : col.id,
      visible: visibleColumns?.includes(col.id) ?? true,
    }));
  }, [columns, visibleColumns]);

  // Search is now handled at the page level, so use beacons directly
  const filteredData = beacons;

  return (
    <div className="space-y-4">
      <DataTableToolbar
        facetedFilters={facetedFilters}
        columns={columnVisibility}
        onColumnToggle={onColumnVisibilityChange}
      />
      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        emptyMessage="No beacons found"
        emptyIcon={<Radio className="h-12 w-12 text-muted-foreground" />}
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
