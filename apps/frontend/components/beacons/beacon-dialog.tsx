'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BeaconForm } from './beacon-form';
import type { CreateBeaconInput, UpdateBeaconInput } from '@/types/forms';
import type { Sector } from '@/types/sector';
import type { Beacon } from '@/types/beacon';

export interface BeaconDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectors: Sector[];
  beacon?: Beacon;
  onSubmit: (data: CreateBeaconInput | UpdateBeaconInput) => void;
  isLoading?: boolean;
}

export function BeaconDialog({
  open,
  onOpenChange,
  sectors,
  beacon,
  onSubmit,
  isLoading,
}: BeaconDialogProps) {
  const isEdit = !!beacon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Beacon' : 'Create Beacon'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the beacon information below.'
              : 'Fill in the details to register a new beacon.'}
          </DialogDescription>
        </DialogHeader>
        <BeaconForm
          sectors={sectors}
          defaultValues={
            beacon
              ? {
                  beaconId: beacon.beaconId,
                  sectorId: beacon.sectorId,
                  powerState: beacon.powerState,
                  mqttUsername: beacon.mqttUsername || undefined,
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
