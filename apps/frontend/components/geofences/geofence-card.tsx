'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GeofenceMap } from './geofence-map';
import { formatShortDate } from '@/lib/date-utils';
import { type Geofence } from '@/types/geofence';
import { MapPin, Edit, Trash2 } from 'lucide-react';

export interface GeofenceCardProps {
  geofence: Geofence;
  onEdit?: (geofenceId: string) => void;
  onDelete?: (geofenceId: string) => void;
}

export function GeofenceCard({ geofence, onEdit, onDelete }: GeofenceCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {geofence.name || `Geofence ${geofence.id.slice(-6)}`}
            </CardTitle>
            <CardDescription>{geofence.sector.name}</CardDescription>
          </div>
          <Badge variant="outline">
            <MapPin className="mr-1 h-3 w-3" />
            {geofence.coordinates.length} points
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <GeofenceMap coordinates={geofence.coordinates} width={350} height={200} />
          <div className="text-sm text-muted-foreground">
            <div>Associated Beacons: {geofence.beacons.length}</div>
            <div>Created: {formatShortDate(geofence.createdAt)}</div>
          </div>
          {(onEdit || onDelete) && (
            <div className="flex gap-2 pt-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(geofence.id)}
                  className="flex-1"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(geofence.id)}
                  className="flex-1"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
