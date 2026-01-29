'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { GeofenceMap } from './geofence-map';
import type { CreateGeofenceInput, UpdateGeofenceInput } from '@/types/forms';
import { createGeofenceInputSchema, updateGeofenceInputSchema } from '@/types/forms';
import type { Sector } from '@/types/sector';
import type { CoordinatePoint } from '@/types/common';
import { Plus, Trash2 } from 'lucide-react';

export interface GeofenceFormProps {
  sectors: Sector[];
  defaultValues?: Partial<UpdateGeofenceInput & { id: string }>;
  onSubmit: (data: CreateGeofenceInput | UpdateGeofenceInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function GeofenceForm({
  sectors,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
}: GeofenceFormProps) {
  const isEdit = !!defaultValues?.id;
  const schema = isEdit ? updateGeofenceInputSchema : createGeofenceInputSchema;

  const [coordinates, setCoordinates] = useState<CoordinatePoint[]>(
    (defaultValues?.coordinates as CoordinatePoint[]) || []
  );
  const [newX, setNewX] = useState('');
  const [newY, setNewY] = useState('');

  const form = useForm<CreateGeofenceInput | UpdateGeofenceInput>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      sectorId: '',
      coordinates: [],
    },
  });

  const handleAddCoordinate = () => {
    const x = parseFloat(newX);
    const y = parseFloat(newY);
    if (!isNaN(x) && !isNaN(y)) {
      const newCoord: CoordinatePoint = { x, y };
      const updated = [...coordinates, newCoord];
      setCoordinates(updated);
      form.setValue('coordinates', updated);
      setNewX('');
      setNewY('');
    }
  };

  const handleRemoveCoordinate = (index: number) => {
    const updated = coordinates.filter((_, i) => i !== index);
    setCoordinates(updated);
    form.setValue('coordinates', updated);
  };

  const handleSubmit = (data: CreateGeofenceInput | UpdateGeofenceInput) => {
    onSubmit({ ...data, coordinates });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="sectorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sector</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sector" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.sectorId} value={sector.sectorId}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Select the sector this geofence belongs to</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Geofence name" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>Optional name for this geofence</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div>
            <Label>Coordinates</Label>
            <FormDescription className="mt-1">
              Add at least 3 coordinate points to define the geofence polygon (local X/Y meters)
            </FormDescription>
          </div>

          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="X (meters)"
              value={newX}
              onChange={(e) => setNewX(e.target.value)}
              disabled={isLoading}
              step="0.1"
            />
            <Input
              type="number"
              placeholder="Y (meters)"
              value={newY}
              onChange={(e) => setNewY(e.target.value)}
              disabled={isLoading}
              step="0.1"
            />
            <Button
              type="button"
              onClick={handleAddCoordinate}
              disabled={isLoading || !newX || !newY}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {coordinates.length > 0 && (
            <div className="space-y-2">
              <div className="max-h-32 overflow-y-auto space-y-1">
                {coordinates.map((coord, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded border p-2 text-sm"
                  >
                    <span>
                      Point {index + 1}: ({coord.x}, {coord.y})
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCoordinate(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {coordinates.length >= 3 && (
                <div className="mt-4">
                  <GeofenceMap coordinates={coordinates} width={400} height={300} />
                </div>
              )}
            </div>
          )}

          {form.formState.errors.coordinates && (
            <p className="text-sm text-destructive">
              {form.formState.errors.coordinates.message}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || coordinates.length < 3}>
            {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
