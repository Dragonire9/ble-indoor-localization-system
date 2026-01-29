import express, { Express } from 'express';
import { createServer } from 'http';
import logger from './lib/logger';
import { errorHandler } from './middleware/error-handler.middleware';
import { requestLogger } from './middleware/request-logger.middleware';
import { rateLimit } from './middleware/rate-limit.middleware';
import { initializeMqttClient } from './lib/mqtt-client';
import { initializeWebSocketServer } from './lib/websocket-server';
import { setupSwagger } from './lib/swagger';
import { HealthController } from './controllers/health.controller';
import { BeaconRepository } from './repositories/beacon.repository';
import { BeaconTelemetryRepository } from './repositories/telemetry.repository';
import { TelemetryService } from './services/telemetry.service';
import { MqttService } from './services/mqtt.service';
import { WebSocketService } from './services/websocket.service';
import { BeaconService } from './services/beacon.service';
import { BeaconController } from './controllers/beacon.controller';
import { validate } from './middleware/validation.middleware';
import {
  createBeaconSchema,
  updateBeaconSchema,
  getBeaconSchema,
  getBeaconsSchema,
  getBeaconTelemetrySchema,
} from './schemas/beacon.schema';
import {
  createGeofenceSchema,
  updateGeofenceSchema,
  getGeofenceSchema,
  getGeofencesSchema,
} from './schemas/geofence.schema';
import { GeofenceRepository } from './repositories/geofence.repository';
import { GeofenceService } from './services/geofence.service';
import { GeofenceController } from './controllers/geofence.controller';
import { SectorRepository } from './repositories/sector.repository';
import { SectorService } from './services/sector.service';
import { SectorController } from './controllers/sector.controller';
import {
  createSectorSchema,
  updateSectorSchema,
  getSectorSchema,
  getSectorsSchema,
} from './schemas/sector.schema';
import { auth } from './lib/auth';
import { toNodeHandler } from 'better-auth/node';

const app: Express = express();
const httpServer = createServer(app);

// Initialize WebSocket server
initializeWebSocketServer(httpServer);

// CORS configuration (must be BEFORE Better Auth handler to handle preflight requests)
app.use((req, res, next) => {
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000']; // Default to frontend origin in development

  const requestOrigin = req.headers.origin;

  // When credentials are included, we must use exact origin (not *)
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.header('Access-Control-Allow-Origin', requestOrigin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else if (allowedOrigins.includes('*') && !requestOrigin) {
    // Only use * if no origin header (same-origin request) and * is explicitly allowed
    res.header('Access-Control-Allow-Origin', '*');
  } else if (requestOrigin) {
    // Origin not allowed - don't set CORS headers (will be blocked by browser)
    // This is intentional for security
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Better Auth handler (must be mounted BEFORE express.json())
// Express v5 requires named wildcard syntax: {*any} instead of /*
app.all('/api/auth/{*any}', toNodeHandler(auth));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLogger);

// Swagger/OpenAPI documentation
setupSwagger(app);

// Rate limiting
app.use('/api', rateLimit);

// Initialize repositories
const beaconRepository = new BeaconRepository();
const telemetryRepository = new BeaconTelemetryRepository();
const geofenceRepository = new GeofenceRepository();
const sectorRepository = new SectorRepository();

// Initialize services
const telemetryService = new TelemetryService(telemetryRepository, beaconRepository);
const websocketService = new WebSocketService();
const mqttService = new MqttService(beaconRepository, telemetryService, websocketService);
const beaconService = new BeaconService(beaconRepository);
const geofenceService = new GeofenceService(geofenceRepository, websocketService);
const sectorService = new SectorService(sectorRepository);

// Initialize MQTT client and service (non-blocking - app works without MQTT)
try {
  initializeMqttClient();
  mqttService.initialize();
} catch (error) {
  logger.warn('MQTT initialization failed - API will continue without MQTT', {
    error: error instanceof Error ? error.message : 'Unknown error',
  });
}

// Initialize health controller with MQTT service
const healthController = new HealthController(mqttService);
app.get('/api/health', (req, res) => healthController.getHealth(req, res));

// Initialize controllers
const beaconController = new BeaconController(beaconService, telemetryRepository);
const geofenceController = new GeofenceController(geofenceService);
const sectorController = new SectorController(sectorService);

// Beacon routes
app.get('/api/beacons', validate(getBeaconsSchema), (req, res, next) =>
  beaconController.getAllBeacons(req, res, next)
);
app.get('/api/beacons/filter-counts', (req, res, next) =>
  beaconController.getFilterCounts(req, res, next)
);
app.post('/api/beacons', validate(createBeaconSchema), (req, res, next) =>
  beaconController.createBeacon(req, res, next)
);
app.get('/api/beacons/:beaconId', validate(getBeaconSchema), (req, res, next) =>
  beaconController.getBeaconById(req, res, next)
);
app.put('/api/beacons/:beaconId', validate(updateBeaconSchema), (req, res, next) =>
  beaconController.updateBeacon(req, res, next)
);
app.delete('/api/beacons/:beaconId', validate(getBeaconSchema), (req, res, next) =>
  beaconController.deleteBeacon(req, res, next)
);
app.get('/api/beacons/:beaconId/telemetry', validate(getBeaconTelemetrySchema), (req, res, next) =>
  beaconController.getBeaconTelemetry(req, res, next)
);

// Geofence routes
app.get('/api/geofences', validate(getGeofencesSchema), (req, res, next) =>
  geofenceController.getAllGeofences(req, res, next)
);
app.post('/api/geofences', validate(createGeofenceSchema), (req, res, next) =>
  geofenceController.createGeofence(req, res, next)
);
app.get('/api/geofences/:geofenceId', validate(getGeofenceSchema), (req, res, next) =>
  geofenceController.getGeofenceById(req, res, next)
);
app.put('/api/geofences/:geofenceId', validate(updateGeofenceSchema), (req, res, next) =>
  geofenceController.updateGeofence(req, res, next)
);
app.delete('/api/geofences/:geofenceId', validate(getGeofenceSchema), (req, res, next) =>
  geofenceController.deleteGeofence(req, res, next)
);

// Sector routes
app.get('/api/sectors', validate(getSectorsSchema), (req, res, next) =>
  sectorController.getAllSectors(req, res, next)
);
app.post('/api/sectors', validate(createSectorSchema), (req, res, next) =>
  sectorController.createSector(req, res, next)
);
app.get('/api/sectors/:sectorId', validate(getSectorSchema), (req, res, next) =>
  sectorController.getSectorById(req, res, next)
);
app.put('/api/sectors/:sectorId', validate(updateSectorSchema), (req, res, next) =>
  sectorController.updateSector(req, res, next)
);
app.delete('/api/sectors/:sectorId', validate(getSectorSchema), (req, res, next) =>
  sectorController.deleteSector(req, res, next)
);

// Error handler (must be last)
app.use(errorHandler);

export default app;
export { httpServer };
