# Quick Start Guide

**Feature**: BLE Beacon Backend System
**Date**: 2025-01-27
**Purpose**: Get started with backend development

## Prerequisites

- Node.js 18+ (LTS version)
- MongoDB 6.0+ (local or cloud instance)
- MQTT Broker (Mosquitto, HiveMQ, or cloud MQTT service)
- Git

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Install development dependencies
npm install --save-dev @types/node @types/express typescript ts-node jest @types/jest
```

### 2. Environment Configuration

Create `.env` file in backend root:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/ble-localization"

# MQTT Broker
MQTT_BROKER_URL="mqtt://localhost:1883"
MQTT_BROKER_USERNAME="admin"
MQTT_BROKER_PASSWORD="password"

# Server
PORT=3000
NODE_ENV=development

# Logging
LOG_LEVEL=info

# WebSocket
WEBSOCKET_PORT=3001
```

### 3. Database Setup

```bash
# Initialize Prisma
npx prisma init

# Update prisma/schema.prisma with data model from data-model.md

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed initial data
npx prisma db seed
```

### 4. Project Structure Setup

Create the following directory structure:

```bash
mkdir -p src/{controllers,services,repositories,middleware,lib,types,schemas}
mkdir -p tests/{unit,integration,contract}
```

## Development Workflow

### 1. Start Development Server

```bash
# Start with hot reload (using nodemon or ts-node-dev)
npm run dev

# Or build and run
npm run build
npm start
```

### 2. Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run in watch mode
npm run test:watch
```

### 3. Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (development only)
npx prisma migrate reset
```

## Implementation Order

### Phase 1: Foundation (Setup)
1. Set up Express.js server
2. Configure Prisma with MongoDB
3. Set up Winston logger
4. Create error handling middleware
5. Set up environment configuration

### Phase 2: MQTT Integration
1. Install and configure MQTT client (`mqtt.js`)
2. Connect to MQTT broker
3. Subscribe to beacon topics (`beacon/+/telemetry`, `beacon/+/heartbeat`)
4. Handle MQTT messages and parse payloads
5. Implement connection state tracking (LWT + heartbeat)

### Phase 3: Data Layer (Repositories)
1. Implement `BeaconRepository` (CRUD operations)
2. Implement `BeaconTelemetryRepository` (create, query by beaconId, time range)
3. Implement `GeofenceRepository` (CRUD operations)
4. Implement `SectorRepository` (CRUD operations)
5. Ensure no N+1 queries (use Prisma `include` and batch queries)

### Phase 4: Business Logic (Services)
1. Implement `BeaconService` (business logic for beacon management)
2. Implement `MqttService` (handle MQTT message processing)
3. Implement `GeofenceService` (geofence validation and management)
4. Implement `TelemetryService` (telemetry data processing)
5. Implement `WebSocketService` (broadcast updates to clients)

### Phase 5: API Layer (Controllers)
1. Implement `BeaconController` (HTTP endpoints for beacon CRUD)
2. Implement `GeofenceController` (HTTP endpoints for geofence CRUD)
3. Implement `SectorController` (HTTP endpoints for sector CRUD)
4. Add input validation middleware (Zod schemas)
5. Add error handling middleware

### Phase 6: WebSocket Server
1. Set up Socket.io server
2. Implement connection handling
3. Implement event broadcasting (beacon state changes, telemetry)
4. Add reconnection handling
5. Test with multiple clients

## Testing Strategy

### Unit Tests
- Test services with mocked repositories
- Test utilities and helpers
- Test validation schemas

### Integration Tests
- Test API endpoints with test database
- Test MQTT message handling
- Test WebSocket events
- Test database operations

### Contract Tests
- Validate API contract compliance
- Test WebSocket event formats
- Validate data model constraints

## Key Implementation Notes

### MQTT Topic Subscription

```typescript
// Subscribe to all beacon telemetry topics
mqttClient.subscribe('beacon/+/telemetry', { qos: 1 });
mqttClient.subscribe('beacon/+/heartbeat', { qos: 1 });
mqttClient.subscribe('beacon/+/status', { qos: 1 }); // LWT topic
```

### WebSocket Broadcasting

```typescript
// Broadcast beacon state change to all clients
io.emit('beacon:state-changed', {
  beaconId: 'beacon-001',
  connectionState: 'ONLINE',
  timestamp: new Date().toISOString()
});
```

### Database Query Optimization

```typescript
// Good: Use include to avoid N+1
const beacons = await prisma.beacon.findMany({
  include: {
    sector: true,
    geofence: true
  }
});

// Bad: N+1 query (FORBIDDEN)
const beacons = await prisma.beacon.findMany();
for (const beacon of beacons) {
  beacon.sector = await prisma.sector.findUnique({ where: { id: beacon.sectorId } });
}
```

## Common Issues & Solutions

### Issue: MQTT Connection Fails
- Check MQTT broker is running
- Verify credentials in `.env`
- Check network connectivity
- Review MQTT broker logs

### Issue: Database Connection Errors
- Verify MongoDB is running
- Check `DATABASE_URL` in `.env`
- Ensure Prisma migrations are applied
- Check MongoDB connection permissions

### Issue: WebSocket Connection Fails
- Verify Socket.io server is initialized
- Check CORS configuration
- Review client connection URL
- Check firewall/network settings

## Next Steps

After completing the quick start:
1. Review [data-model.md](./data-model.md) for entity details
2. Review [contracts/](./contracts/) for API specifications
3. Review [research.md](./research.md) for technology decisions
4. Proceed to `/speckit.tasks` to generate implementation tasks

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [MQTT.js Documentation](https://github.com/mqttjs/MQTT.js)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Express.js Documentation](https://expressjs.com/)
- [Zod Documentation](https://zod.dev/)
