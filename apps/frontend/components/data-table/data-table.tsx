'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type SortDirection = 'asc' | 'desc' | null;

export interface ColumnDef<T> {
  id: string;
  header: string | ((props: { column: Column<T> }) => React.ReactNode);
  accessorKey?: keyof T;
  accessorFn?: (row: T) => React.ReactNode;
  cell?: (props: { row: T; value: any }) => React.ReactNode;
  enableSorting?: boolean;
  enableHiding?: boolean;
  className?: string;
}

export interface Column<T> {
  id: string;
  toggleVisibility: (visible: boolean) => void;
  getIsVisible: () => boolean;
  getCanSort: () => boolean;
  getToggleSortingHandler: () => (() => void) | undefined;
  getIsSorted: () => SortDirection;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  sorting?: {
    column: string | null;
    direction: SortDirection;
  };
  onSort?: (column: string, direction: SortDirection) => void;
  visibleColumns?: string[];
  onColumnVisibilityChange?: (columnId: string, visible: boolean) => void;
  getRowId?: (row: T) => string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
  emptyIcon,
  sorting,
  onSort,
  visibleColumns,
  onColumnVisibilityChange,
  getRowId,
  className,
}: DataTableProps<T>) {
  // Filter visible columns
  const displayColumns = React.useMemo(() => {
    if (!visibleColumns) return columns;
    return columns.filter((col) => visibleColumns.includes(col.id));
  }, [columns, visibleColumns]);

  // Create column objects for sorting
  const columnMap = React.useMemo(() => {
    const map = new Map<string, Column<T>>();
    displayColumns.forEach((col) => {
      const isSorted = sorting?.column === col.id ? sorting.direction : null;
      map.set(col.id, {
        id: col.id,
        toggleVisibility: (visible: boolean) => {
          onColumnVisibilityChange?.(col.id, visible);
        },
        getIsVisible: () => visibleColumns?.includes(col.id) ?? true,
        getCanSort: () => col.enableSorting ?? false,
        getToggleSortingHandler: () => {
          if (!col.enableSorting || !onSort) return undefined;
          return () => {
            const currentDirection = isSorted;
            let newDirection: SortDirection = 'asc';
            if (currentDirection === 'asc') {
              newDirection = 'desc';
            } else if (currentDirection === 'desc') {
              newDirection = null;
            }
            onSort(col.id, newDirection);
          };
        },
        getIsSorted: () => isSorted,
      });
    });
    return map;
  }, [displayColumns, sorting, onSort, visibleColumns, onColumnVisibilityChange]);

  const renderHeader = (column: ColumnDef<T>, col: Column<T>) => {
    if (typeof column.header === 'function') {
      return column.header({ column: col });
    }

    if (column.enableSorting && onSort) {
      const sortHandler = col.getToggleSortingHandler();
      const sortDirection = col.getIsSorted();

      return (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          onClick={sortHandler}
        >
          <span>{column.header}</span>
          {sortDirection === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : sortDirection === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
          )}
        </Button>
      );
    }

    return column.header;
  };

  const getCellValue = (row: T, column: ColumnDef<T>) => {
    if (column.accessorFn) {
      return column.accessorFn(row);
    }
    if (column.accessorKey) {
      return row[column.accessorKey];
    }
    return null;
  };

  const renderCell = (row: T, column: ColumnDef<T>) => {
    const value = getCellValue(row, column);
    if (column.cell) {
      return column.cell({ row, value });
    }
    return value;
  };

  // Sort data client-side if sorting is provided
  const sortedData = React.useMemo(() => {
    if (!sorting?.column || !sorting.direction) return data;
    
    const column = columns.find((col) => col.id === sorting.column);
    if (!column || !column.enableSorting) return data;

    return [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (column.accessorFn) {
        aValue = column.accessorFn(a);
        bValue = column.accessorFn(b);
      } else if (column.accessorKey) {
        aValue = a[column.accessorKey];
        bValue = b[column.accessorKey];
      } else {
        return 0;
      }

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Compare values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sorting.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sorting.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Fallback to string comparison
      const aStr = String(aValue);
      const bStr = String(bValue);
      return sorting.direction === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [data, sorting, columns]);

  // Use sorted data if sorting is enabled, otherwise use original data
  const displayData = sorting?.column && sorting.direction ? sortedData : data;

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {displayColumns.map((column) => (
                <TableHead key={column.id} className={column.className}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                {displayColumns.map((column) => (
                  <TableCell key={column.id} className={column.className}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (displayData.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-md border p-8">
        {emptyIcon && <div className="mb-4 text-muted-foreground">{emptyIcon}</div>}
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-md border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {displayColumns.map((column) => {
              const col = columnMap.get(column.id)!;
              return (
                <TableHead key={column.id} className={column.className}>
                  {renderHeader(column, col)}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.map((row, rowIndex) => {
            const rowId = getRowId ? getRowId(row) : `row-${rowIndex}`;
            return (
              <TableRow key={rowId}>
                {displayColumns.map((column) => (
                  <TableCell key={column.id} className={column.className}>
                    {renderCell(row, column)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
