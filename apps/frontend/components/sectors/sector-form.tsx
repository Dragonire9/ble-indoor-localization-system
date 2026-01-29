'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DialogFooter } from '@/components/ui/dialog';
import type { CreateSectorInput, UpdateSectorInput } from '@/types/forms';
import { createSectorInputSchema, updateSectorInputSchema } from '@/types/forms';

export interface SectorFormProps {
  defaultValues?: Partial<UpdateSectorInput & { sectorId: string }>;
  onSubmit: (data: CreateSectorInput | UpdateSectorInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SectorForm({ defaultValues, onSubmit, onCancel, isLoading }: SectorFormProps) {
  const isEdit = !!defaultValues?.sectorId;
  const schema = isEdit ? updateSectorInputSchema : createSectorInputSchema;

  const form = useForm<CreateSectorInput | UpdateSectorInput>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      name: '',
      description: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!isEdit && (
          <FormField
            control={form.control}
            name="sectorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sector ID</FormLabel>
                <FormControl>
                  <Input placeholder="SECTOR-001" {...field} disabled={isLoading} />
                </FormControl>
                <FormDescription>Unique identifier for the sector</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Sector Name" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>Display name for this sector</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Sector description" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>Optional description for this sector</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
