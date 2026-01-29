export interface CoordinatePoint {
  x: number;
  y: number;
}

export interface Geofence {
  id: string;
  sectorId: string;
  name?: string;
  coordinates: CoordinatePoint[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface CreateGeofenceInput {
  sectorId: string;
  name?: string;
  coordinates: CoordinatePoint[];
  metadata?: Record<string, unknown>;
}

export interface UpdateGeofenceInput {
  name?: string;
  coordinates?: CoordinatePoint[];
  metadata?: Record<string, unknown>;
}

import { PaginationParams } from './pagination.types';

export interface GeofenceQueryFilters extends PaginationParams {
  sectorId?: string;
  beaconId?: string;
}
