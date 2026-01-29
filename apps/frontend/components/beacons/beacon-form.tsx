'use client';

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
import type { CreateBeaconInput, UpdateBeaconInput } from '@/types/forms';
import { createBeaconInputSchema, updateBeaconInputSchema } from '@/types/forms';
import type { Sector } from '@/types/sector';

export interface BeaconFormProps {
  sectors: Sector[];
  defaultValues?: Partial<UpdateBeaconInput & { beaconId: string }>;
  onSubmit: (data: CreateBeaconInput | UpdateBeaconInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BeaconForm({
  sectors,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
}: BeaconFormProps) {
  const isEdit = !!defaultValues?.beaconId;
  const schema = isEdit ? updateBeaconInputSchema : createBeaconInputSchema;

  const form = useForm<CreateBeaconInput | UpdateBeaconInput>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      sectorId: '',
      powerState: 'ON',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!isEdit && (
          <FormField
            control={form.control}
            name="beaconId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beacon ID</FormLabel>
                <FormControl>
                  <Input placeholder="BEACON-001" {...field} disabled={isLoading} />
                </FormControl>
                <FormDescription>Unique identifier for the beacon</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
              <FormDescription>Select the sector this beacon belongs to</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="powerState"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Power State</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select power state" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ON">ON</SelectItem>
                  <SelectItem value="OFF">OFF</SelectItem>
                  <SelectItem value="LOW_BATTERY">LOW_BATTERY</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Initial power state of the beacon</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mqttUsername"
          render={({ field }) => (
            <FormItem>
              <FormLabel>MQTT Username (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="mqtt_user" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>MQTT authentication username</FormDescription>
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
