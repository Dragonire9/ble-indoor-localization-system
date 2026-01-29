'use client';

import { type Sector } from '@/types/sector';
import { SectorCard } from './sector-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2 } from 'lucide-react';
import type { Pagination } from '@/types/pagination';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface SectorListProps {
  sectors: Sector[];
  isLoading?: boolean;
  onEdit?: (sectorId: string) => void;
  onDelete?: (sectorId: string) => void;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
}

export function SectorList({ sectors, isLoading, onEdit, onDelete, pagination, onPageChange }: SectorListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  if (sectors.length === 0) {
    return (
      <EmptyState
        icon={<Building2 className="h-12 w-12 text-muted-foreground" />}
        title="No sectors defined"
        description="Create your first sector to organize beacons and geofences"
        action={{
          label: 'Create Sector',
          onClick: () => {
            window.location.href = '/sectors';
          },
        }}
      />
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sectors.map((sector) => (
          <SectorCard
            key={sector.id}
            sector={sector}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} sectors
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={!pagination.hasNext}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
