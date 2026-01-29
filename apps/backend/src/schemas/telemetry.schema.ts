import { z } from 'zod';

export const mqttTelemetryPayloadSchema = z.object({
  rssi: z.number().min(-100).max(0).optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  powerState: z.enum(['ON', 'OFF', 'LOW_BATTERY']).optional(),
  transmissionPower: z.number().optional(),
  zoneFlags: z.array(z.string()).optional().default([]),
  roleFlags: z.array(z.string()).optional().default([]),
  message: z.string().max(1000).optional(),
  rawData: z.record(z.unknown()).optional(),
});

export const mqttHeartbeatPayloadSchema = z.object({
  timestamp: z.string().datetime(),
});

export type MqttTelemetryPayload = z.infer<typeof mqttTelemetryPayloadSchema>;
export type MqttHeartbeatPayload = z.infer<typeof mqttHeartbeatPayloadSchema>;
