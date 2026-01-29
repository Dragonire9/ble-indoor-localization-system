import { PowerState } from '@prisma/client';

export interface BeaconTelemetry {
  id: string;
  beaconId: string;
  timestamp: Date;
  rssi?: number;
  batteryLevel?: number;
  powerState?: PowerState;
  transmissionPower?: number;
  zoneFlags: string[];
  roleFlags: string[];
  message?: string;
  rawData?: Record<string, unknown>;
}

export interface MqttTelemetryPayload {
  rssi?: number;
  batteryLevel?: number;
  powerState?: PowerState;
  transmissionPower?: number;
  zoneFlags?: string[];
  roleFlags?: string[];
  message?: string;
  rawData?: Record<string, unknown>;
}

export interface MqttHeartbeatPayload {
  timestamp: string;
}

export interface MqttTopicInfo {
  beaconId: string;
  topicType: 'telemetry' | 'heartbeat' | 'status';
}
