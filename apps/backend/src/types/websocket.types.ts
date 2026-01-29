import { PowerState, ConnectionState } from '@prisma/client';
import { BeaconTelemetry } from './mqtt.types';
import { Geofence } from './geofence.types';

export interface BeaconStateChangedEvent {
  beaconId: string;
  connectionState: ConnectionState;
  timestamp: string;
}

export interface BeaconTelemetryEvent {
  beaconId: string;
  telemetry: BeaconTelemetry;
}

export interface BeaconPowerStateChangedEvent {
  beaconId: string;
  powerState: PowerState;
  timestamp: string;
}

export interface GeofenceUpdatedEvent {
  action: 'created' | 'updated' | 'deleted';
  geofenceId: string;
  geofence: Geofence | null;
  timestamp: string;
}

export interface WebSocketError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
