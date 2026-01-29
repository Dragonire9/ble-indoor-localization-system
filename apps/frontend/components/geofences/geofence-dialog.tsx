'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GeofenceForm } from './geofence-form';
import type { CreateGeofenceInput, UpdateGeofenceInput } from '@/types/forms';
import type { Sector } from '@/types/sector';
import type { Geofence } from '@/types/geofence';

export interface GeofenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectors: Sector[];
  geofence?: Geofence;
  onSubmit: (data: CreateGeofenceInput | UpdateGeofenceInput) => void;
  isLoading?: boolean;
}

export function GeofenceDialog({
  open,
  onOpenChange,
  sectors,
  geofence,
  onSubmit,
  isLoading,
}: GeofenceDialogProps) {
  const isEdit = !!geofence;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Geofence' : 'Create Geofence'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the geofence polygon and information below.'
              : 'Define a new geofence by adding coordinate points (local X/Y meters).'}
          </DialogDescription>
        </DialogHeader>
        <GeofenceForm
          sectors={sectors}
          defaultValues={
            geofence
              ? {
                  id: geofence.id,
                  sectorId: geofence.sectorId,
                  name: geofence.name || undefined,
                  coordinates: geofence.coordinates,
                }
              : undefined
          }
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
