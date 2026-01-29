'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Sector } from '@/types/sector';

export interface DeleteSectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sector: Sector;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteSectorDialog({
  open,
  onOpenChange,
  sector,
  onConfirm,
  isLoading,
}: DeleteSectorDialogProps) {
  const hasBeacons = sector.beacons.length > 0;
  const hasGeofences = sector.geofences.length > 0;
  const canDelete = !hasBeacons && !hasGeofences;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {canDelete ? (
              <>
                This action cannot be undone. This will permanently delete the sector{' '}
                <strong>{sector.name}</strong>.
              </>
            ) : (
              <>
                Cannot delete sector <strong>{sector.name}</strong> because it has associated
                beacons ({sector.beacons.length}) or geofences ({sector.geofences.length}).
                Please remove all associated beacons and geofences before deleting this sector.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          {canDelete && (
            <AlertDialogAction
              onClick={onConfirm}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
