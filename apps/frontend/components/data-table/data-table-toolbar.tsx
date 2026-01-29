'use client';

import * as React from 'react';
import { Search, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableFacetedFilter, type FacetedFilterOption } from './data-table-faceted-filter';
import { cn } from '@/lib/utils';

export type ViewMode = 'list' | 'grid';

export interface DataTableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  facetedFilters?: Array<{
    title: string;
    options: FacetedFilterOption[];
    selectedValues: string[];
    onSelectedChange: (values: string[]) => void;
    getCounts?: () => Promise<Record<string, number>>;
    isLoading?: boolean;
  }>;
  columns?: Array<{
    id: string;
    label: string;
    visible: boolean;
  }>;
  onColumnToggle?: (columnId: string, visible: boolean) => void;
  className?: string;
}

export function DataTableToolbar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Filter items...',
  facetedFilters = [],
  columns = [],
  onColumnToggle,
  className,
}: DataTableToolbarProps) {
  const [searchInput, setSearchInput] = React.useState(searchValue);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange?.(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, onSearchChange]);

  React.useEffect(() => {
    setSearchInput(searchValue);
  }, [searchValue]);

  const visibleColumns = columns.filter((col) => col.visible);
  const hasColumnVisibility = columns.length > 0 && onColumnToggle;

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex flex-1 items-center gap-2">
        {onSearchChange && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-8 h-8"
            />
          </div>
        )}
        {facetedFilters.map((filter) => (
          <DataTableFacetedFilter
            key={filter.title}
            title={filter.title}
            options={filter.options}
            selectedValues={filter.selectedValues}
            onSelectedChange={filter.onSelectedChange}
            getCounts={filter.getCounts}
            isLoading={filter.isLoading}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        {hasColumnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Eye className="mr-2 h-4 w-4" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.visible}
                  onCheckedChange={(checked) =>
                    onColumnToggle(column.id, checked)
                  }
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
