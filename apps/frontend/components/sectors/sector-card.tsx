'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type Sector } from '@/types/sector';
import { Building2, Radio, MapPin, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export interface SectorCardProps {
  sector: Sector;
  onEdit?: (sectorId: string) => void;
  onDelete?: (sectorId: string) => void;
}

export function SectorCard({ sector, onEdit, onDelete }: SectorCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{sector.name}</CardTitle>
            <CardDescription>{sector.sectorId}</CardDescription>
          </div>
          <Badge variant="outline">
            <Building2 className="mr-1 h-3 w-3" />
            Sector
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sector.description && (
            <p className="text-sm text-muted-foreground">{sector.description}</p>
          )}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Beacons:</span>
              <span className="font-medium">{sector.beacons.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Geofences:</span>
              <span className="font-medium">{sector.geofences.length}</span>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link href={`/sectors/${sector.sectorId}`}>View Details</Link>
            </Button>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(sector.sectorId)}
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
                onClick={() => onDelete(sector.sectorId)}
                className="flex-1"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
