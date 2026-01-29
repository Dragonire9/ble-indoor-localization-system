import { getWebSocketServer } from '../lib/websocket-server';
import {
  BeaconStateChangedEvent,
  BeaconTelemetryEvent,
  BeaconPowerStateChangedEvent,
  GeofenceUpdatedEvent,
} from '../types/websocket.types';
import { ConnectionState, PowerState } from '@prisma/client';
import { BeaconTelemetry } from '../types/mqtt.types';
import logger from '../lib/logger';

export interface WebSocketConnectionStats {
  totalConnections: number;
  connectedClients: string[];
}

export class WebSocketService {
  broadcastStateChange(beaconId: string, connectionState: ConnectionState): void {
    try {
      const io = getWebSocketServer();
      const event: BeaconStateChangedEvent = {
        beaconId,
        connectionState,
        timestamp: new Date().toISOString(),
      };
      io.emit('beacon:state-changed', event);
      logger.debug('Broadcasted state change', { beaconId, connectionState });
    } catch (error) {
      logger.error('Error broadcasting state change', {
        beaconId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  broadcastTelemetry(beaconId: string, telemetry: BeaconTelemetry): void {
    try {
      const io = getWebSocketServer();
      const event: BeaconTelemetryEvent = {
        beaconId,
        telemetry,
      };
      io.emit('beacon:telemetry', event);
      logger.debug('Broadcasted telemetry', { beaconId });
    } catch (error) {
      logger.error('Error broadcasting telemetry', {
        beaconId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  broadcastPowerStateChange(beaconId: string, powerState: PowerState): void {
    try {
      const io = getWebSocketServer();
      const event: BeaconPowerStateChangedEvent = {
        beaconId,
        powerState,
        timestamp: new Date().toISOString(),
      };
      io.emit('beacon:power-state-changed', event);
      logger.debug('Broadcasted power state change', { beaconId, powerState });
    } catch (error) {
      logger.error('Error broadcasting power state change', {
        beaconId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  broadcastGeofenceUpdate(
    action: 'created' | 'updated' | 'deleted',
    geofenceId: string,
    geofence: unknown | null
  ): void {
    try {
      const io = getWebSocketServer();
      const event: GeofenceUpdatedEvent = {
        action,
        geofenceId,
        geofence: geofence as GeofenceUpdatedEvent['geofence'],
        timestamp: new Date().toISOString(),
      };
      io.emit('geofence:updated', event);
      logger.debug('Broadcasted geofence update', { geofenceId, action });
    } catch (error) {
      logger.error('Error broadcasting geofence update', {
        geofenceId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  getConnectionStats(): WebSocketConnectionStats {
    try {
      const io = getWebSocketServer();
      const sockets = io.sockets.sockets;
      return {
        totalConnections: sockets.size,
        connectedClients: Array.from(sockets.keys()),
      };
    } catch {
      return {
        totalConnections: 0,
        connectedClients: [],
      };
    }
  }
}
