import { ConnectionState, PowerState } from '@prisma/client';

export interface Beacon {
  id: string;
  beaconId: string;
  sectorId: string;
  geofenceId?: string;
  powerState: PowerState;
  connectionState: ConnectionState;
  lastSeenAt: Date;
  registeredAt: Date;
  mqttUsername?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateBeaconInput {
  beaconId: string;
  sectorId: string;
  geofenceId?: string;
  powerState?: PowerState;
  mqttUsername?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateBeaconInput {
  sectorId?: string;
  geofenceId?: string;
  powerState?: PowerState;
  metadata?: Record<string, unknown>;
}

import { PaginationParams } from './pagination.types';

export interface BeaconQueryFilters extends PaginationParams {
  sectorId?: string | string[];
  connectionState?: ConnectionState | ConnectionState[];
}
