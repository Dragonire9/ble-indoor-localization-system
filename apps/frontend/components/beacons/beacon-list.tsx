'use client';

import { memo } from 'react';
import { type Beacon } from '@/types/beacon';
import { BeaconCard, type BeaconCardProps } from './beacon-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Radio } from 'lucide-react';
import type { Pagination } from '@/types/pagination';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface BeaconListProps {
  beacons: Beacon[];
  latestTelemetryMap?: Record<string, { batteryLevel: number | null; rssi: number | null }>;
  isLoading?: boolean;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
}

// Memoized beacon card to prevent unnecessary re-renders
const MemoizedBeaconCard = memo(BeaconCard);

export const BeaconList = memo(function BeaconList({ 
  beacons, 
  latestTelemetryMap, 
  isLoading, 
  pagination, 
  onPageChange 
}: BeaconListProps) {
  if (isLoading) {
    return (
      <div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        role="status"
        aria-label="Loading beacons"
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-32" aria-hidden="true" />
        ))}
      </div>
    );
  }

  if (beacons.length === 0) {
    return (
      <EmptyState
        icon={<Radio className="h-12 w-12 text-muted-foreground" />}
        title="No beacons registered"
        description="Get started by registering your first BLE beacon device"
        action={{
          label: 'Create Beacon',
          onClick: () => {
            // Navigation will be handled by the parent component
            window.location.href = '/beacons';
          },
        }}
      />
    );
  }

  return (
    <>
      <div 
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label="Beacon list"
      >
        {beacons.map((beacon) => {
          const latestTelemetry = latestTelemetryMap?.[beacon.beaconId];
          return (
            <MemoizedBeaconCard
              key={beacon.id}
              beacon={beacon}
              latestTelemetry={latestTelemetry}
            />
          );
        })}
      </div>
      {pagination && pagination.totalPages > 1 && (
        <nav 
          className="flex items-center justify-between border-t pt-4"
          aria-label="Pagination"
        >
          <div className="text-sm text-muted-foreground" aria-live="polite">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} beacons
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              aria-label="Go to previous page"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Previous</span>
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <div className="text-sm text-muted-foreground" aria-current="page">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={!pagination.hasNext}
              aria-label="Go to next page"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </nav>
      )}
    </>
  );
});
