'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SectorForm } from './sector-form';
import type { CreateSectorInput, UpdateSectorInput } from '@/types/forms';
import type { Sector } from '@/types/sector';

export interface SectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sector?: Sector;
  onSubmit: (data: CreateSectorInput | UpdateSectorInput) => void;
  isLoading?: boolean;
}

export function SectorDialog({
  open,
  onOpenChange,
  sector,
  onSubmit,
  isLoading,
}: SectorDialogProps) {
  const isEdit = !!sector;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Sector' : 'Create Sector'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the sector information below.'
              : 'Fill in the details to create a new sector.'}
          </DialogDescription>
        </DialogHeader>
        <SectorForm
          defaultValues={
            sector
              ? {
                  sectorId: sector.sectorId,
                  name: sector.name,
                  description: sector.description || undefined,
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
