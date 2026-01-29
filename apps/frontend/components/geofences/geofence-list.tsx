'use client';

import { type Geofence } from '@/types/geofence';
import { GeofenceCard } from './geofence-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';
import type { Pagination } from '@/types/pagination';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface GeofenceListProps {
  geofences: Geofence[];
  isLoading?: boolean;
  onEdit?: (geofenceId: string) => void;
  onDelete?: (geofenceId: string) => void;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
}

export function GeofenceList({
  geofences,
  isLoading,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
}: GeofenceListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (geofences.length === 0) {
    return (
      <EmptyState
        icon={<MapPin className="h-12 w-12 text-muted-foreground" />}
        title="No geofences defined"
        description="Create your first geofence to define areas for beacon monitoring"
        action={{
          label: 'Create Geofence',
          onClick: () => {
            window.location.href = '/geofences';
          },
        }}
      />
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {geofences.map((geofence) => (
          <GeofenceCard
            key={geofence.id}
            geofence={geofence}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} geofences
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
