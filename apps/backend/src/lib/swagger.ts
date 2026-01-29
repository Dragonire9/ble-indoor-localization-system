import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import * as path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BLE Beacon Backend API',
      version: '1.0.0',
      description: 'API documentation for BLE Beacon Backend System - Indoor Localization and Navigation',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8000}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Beacon: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique beacon identifier' },
            beaconId: { type: 'string', description: 'Beacon ID (matches MQTT topic)' },
            sectorId: { type: 'string', description: 'Sector ID' },
            geofenceId: { type: 'string', nullable: true, description: 'Geofence ID' },
            powerState: { type: 'string', enum: ['ON', 'OFF', 'LOW_BATTERY'] },
            connectionState: { type: 'string', enum: ['ONLINE', 'OFFLINE'] },
            lastSeenAt: { type: 'string', format: 'date-time' },
            registeredAt: { type: 'string', format: 'date-time' },
            mqttUsername: { type: 'string', nullable: true },
            metadata: { type: 'object', additionalProperties: true },
          },
        },
        Geofence: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            sectorId: { type: 'string' },
            name: { type: 'string', nullable: true },
            coordinates: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  x: { type: 'number' },
                  y: { type: 'number' },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            metadata: { type: 'object', additionalProperties: true },
          },
        },
        Sector: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            sectorId: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            metadata: { type: 'object', additionalProperties: true },
          },
        },
        BeaconTelemetry: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            beaconId: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            rssi: { type: 'number', nullable: true },
            batteryLevel: { type: 'number', nullable: true },
            powerState: { type: 'string', enum: ['ON', 'OFF', 'LOW_BATTERY'], nullable: true },
            transmissionPower: { type: 'number', nullable: true },
            zoneFlags: { type: 'array', items: { type: 'string' } },
            roleFlags: { type: 'array', items: { type: 'string' } },
            message: { type: 'string', nullable: true },
            rawData: { type: 'object', additionalProperties: true, nullable: true },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            statusCode: { type: 'number' },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '../controllers/*.ts'),
    path.join(__dirname, '../app.ts'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'BLE Beacon API Documentation',
  }));

  // JSON endpoint for OpenAPI spec
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};
