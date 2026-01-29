import { Request, Response } from 'express';
import { getMqttClient } from '../lib/mqtt-client';
import { getWebSocketServer } from '../lib/websocket-server';
import logger from '../lib/logger';
import { MqttService } from '../services/mqtt.service';

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Health check endpoints
 */
export class HealthController {
  constructor(private mqttService?: MqttService) {}

  /**
   * @swagger
   * /api/health:
   *   get:
   *     summary: Health check endpoint
   *     description: Returns the health status of the API server and connected services
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Server is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "ok"
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                 uptime:
   *                   type: number
   *                 services:
   *                   type: object
   *       503:
   *         description: Server is unhealthy
   */
  async getHealth(_req: Request, res: Response): Promise<void> {
    try {
      const mqttHealth = this.mqttService
        ? {
            ...this.checkMqttHealth(),
            ...this.mqttService.getConnectionHealth(),
          }
        : this.checkMqttHealth();

      const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
          mqtt: mqttHealth,
          websocket: this.checkWebSocketHealth(),
          database: 'unknown', // Would need Prisma health check
        },
      };

      res.json(health);
    } catch (error) {
      logger.error('Health check failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  private checkMqttHealth(): { status: string; connected: boolean; brokerUrl?: string; lastError?: string } {
    try {
      const client = getMqttClient();
      const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
      return {
        status: client.connected ? 'connected' : 'disconnected',
        connected: client.connected,
        brokerUrl,
      };
    } catch (error) {
      return {
        status: 'not_initialized',
        connected: false,
        lastError: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private checkWebSocketHealth(): { connected: number } {
    try {
      const io = getWebSocketServer();
      const sockets = io.sockets.sockets;
      return { connected: sockets.size };
    } catch {
      return { connected: 0 };
    }
  }
}
