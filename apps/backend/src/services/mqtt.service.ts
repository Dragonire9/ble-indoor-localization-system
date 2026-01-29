import { getMqttClient } from '../lib/mqtt-client';
import { BeaconRepository } from '../repositories/beacon.repository';
import { TelemetryService } from './telemetry.service';
import { WebSocketService } from './websocket.service';
import { mqttTelemetryPayloadSchema, mqttHeartbeatPayloadSchema } from '../schemas/telemetry.schema';
import { MqttTopicInfo } from '../types/mqtt.types';
import logger from '../lib/logger';
import { ConnectionState } from '@prisma/client';

export class MqttService {
  private beaconRepository: BeaconRepository;
  private telemetryService: TelemetryService;
  private websocketService?: WebSocketService;
  private heartbeatTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly HEARTBEAT_TIMEOUT = 60000; // 60 seconds
  private connectionHealth: { connected: boolean; lastConnectionTime?: Date } = { connected: false };

  constructor(
    beaconRepository: BeaconRepository,
    telemetryService: TelemetryService,
    websocketService?: WebSocketService
  ) {
    this.beaconRepository = beaconRepository;
    this.telemetryService = telemetryService;
    this.websocketService = websocketService;
  }

  initialize(): void {
    const mqttClient = getMqttClient();

    // Subscribe to all beacon telemetry topics
    mqttClient.subscribe('beacon/+/telemetry', { qos: 1 });
    mqttClient.subscribe('beacon/+/heartbeat', { qos: 1 });
    mqttClient.subscribe('beacon/+/status', { qos: 1 }); // Last Will topic

    mqttClient.on('message', (topic, message) => {
      this.handleMessage(topic, message.toString());
    });

    mqttClient.on('connect', () => {
      this.connectionHealth.connected = true;
      this.connectionHealth.lastConnectionTime = new Date();
      logger.info('MQTT connection health: connected');
    });

    mqttClient.on('close', () => {
      this.connectionHealth.connected = false;
      logger.warn('MQTT connection health: disconnected');
    });

    mqttClient.on('error', (error) => {
      this.connectionHealth.connected = false;
      logger.error('MQTT connection health: error', { error: error?.message || error?.toString() });
    });

    logger.info('MQTT service initialized and subscribed to beacon topics');
  }

  getConnectionHealth(): { connected: boolean; lastConnectionTime?: Date } {
    return { ...this.connectionHealth };
  }

  private handleMessage(topic: string, payload: string): void {
    try {
      const topicInfo = this.parseTopic(topic);
      if (!topicInfo) {
        logger.warn('Invalid MQTT topic format', { topic });
        return;
      }

      const { beaconId, topicType } = topicInfo;

      switch (topicType) {
        case 'telemetry':
          this.handleTelemetry(beaconId, payload);
          break;
        case 'heartbeat':
          this.handleHeartbeat(beaconId, payload);
          break;
        case 'status':
          this.handleStatus(beaconId, payload);
          break;
        default:
          logger.warn('Unknown topic type', { topic, topicType });
      }
    } catch (error) {
      logger.error('Error handling MQTT message', {
        topic,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private parseTopic(topic: string): MqttTopicInfo | null {
    // Topic format: beacon/{beaconId}/telemetry, beacon/{beaconId}/heartbeat, beacon/{beaconId}/status
    const parts = topic.split('/');
    if (parts.length !== 3 || parts[0] !== 'beacon') {
      return null;
    }

    const beaconId = parts[1];
    const topicType = parts[2] as 'telemetry' | 'heartbeat' | 'status';

    if (!['telemetry', 'heartbeat', 'status'].includes(topicType)) {
      return null;
    }

    return { beaconId, topicType };
  }

  private async handleTelemetry(beaconId: string, payload: string): Promise<void> {
    try {
      const parsed = JSON.parse(payload);
      const validated = mqttTelemetryPayloadSchema.parse(parsed);

      // Update connection state to ONLINE
      await this.updateConnectionState(beaconId, 'ONLINE');

      // Process and store telemetry
      await this.telemetryService.processTelemetry(beaconId, validated);

      // Broadcast to WebSocket clients
      if (this.websocketService) {
        this.websocketService.broadcastTelemetry(beaconId, {
          beaconId,
          timestamp: new Date(),
          ...validated,
          zoneFlags: validated.zoneFlags || [],
          roleFlags: validated.roleFlags || [],
        });
      }

      logger.debug('Telemetry processed', { beaconId });
    } catch (error) {
      logger.error('Error processing telemetry', {
        beaconId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async handleHeartbeat(beaconId: string, payload: string): Promise<void> {
    try {
      const parsed = JSON.parse(payload);
      mqttHeartbeatPayloadSchema.parse(parsed);

      // Update connection state to ONLINE
      await this.updateConnectionState(beaconId, 'ONLINE');

      // Clear existing timeout and set new one
      this.clearHeartbeatTimeout(beaconId);
      this.setHeartbeatTimeout(beaconId);

      logger.debug('Heartbeat received', { beaconId });
    } catch (error) {
      logger.error('Error processing heartbeat', {
        beaconId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async handleStatus(beaconId: string, payload: string): Promise<void> {
    // Last Will message - beacon went offline
    if (payload.trim().toLowerCase() === 'offline') {
      await this.updateConnectionState(beaconId, 'OFFLINE');
      this.clearHeartbeatTimeout(beaconId);
      logger.info('Beacon went offline (LWT)', { beaconId });
    }
  }

  private async updateConnectionState(
    beaconId: string,
    connectionState: ConnectionState
  ): Promise<void> {
    try {
      const beacon = await this.beaconRepository.findById(beaconId);
      if (!beacon) {
        logger.warn('Attempted to update connection state for unknown beacon', { beaconId });
        return;
      }

      const previousState = beacon.connectionState;
      await this.beaconRepository.updateConnectionState(beaconId, connectionState);

      // Broadcast state change if it changed
      if (previousState !== connectionState && this.websocketService) {
        this.websocketService.broadcastStateChange(beaconId, connectionState);
      }

      logger.debug('Connection state updated', { beaconId, connectionState });
    } catch (error) {
      logger.error('Error updating connection state', {
        beaconId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private setHeartbeatTimeout(beaconId: string): void {
    const timeout = setTimeout(async () => {
      logger.warn('Heartbeat timeout - marking beacon as offline', { beaconId });
      await this.updateConnectionState(beaconId, 'OFFLINE');
      this.heartbeatTimeouts.delete(beaconId);
    }, this.HEARTBEAT_TIMEOUT);

    this.heartbeatTimeouts.set(beaconId, timeout);
  }

  private clearHeartbeatTimeout(beaconId: string): void {
    const timeout = this.heartbeatTimeouts.get(beaconId);
    if (timeout) {
      clearTimeout(timeout);
      this.heartbeatTimeouts.delete(beaconId);
    }
  }

  getConnectionHealth(): { connected: boolean; lastConnectionTime?: Date } {
    return { ...this.connectionHealth };
  }
}
