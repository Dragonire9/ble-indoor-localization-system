# BLE Beacon Backend System

Backend system for BLE-based indoor localization and navigation. Receives telemetry data from ESP32 beacons via MQTT, stores data in MongoDB, and provides real-time updates to frontend monitoring clients via WebSockets.

## Features

- **MQTT Integration**: Receives telemetry data from beacons via MQTT protocol
- **Beacon Management**: REST API for managing beacon configurations
- **Geofence Management**: Store and serve polygon-based geofences
- **Real-time Updates**: WebSocket support for live monitoring
- **Data Persistence**: MongoDB storage with Prisma ORM

## Tech Stack

- Node.js 18+ with TypeScript 5.0+
- Express.js for HTTP API
- MQTT.js for MQTT client
- Socket.io for WebSocket server
- Prisma ORM with MongoDB
- Zod for validation
- Winston for structured logging

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Setup database:
```bash
npx prisma generate
npx prisma migrate dev
```

4. Start development server:
```bash
npm run dev
```

## API Endpoints

### Beacons
- `GET /api/beacons` - List all beacons (with optional filtering)
- `POST /api/beacons` - Register a new beacon
- `GET /api/beacons/:beaconId` - Get beacon details
- `PUT /api/beacons/:beaconId` - Update beacon
- `DELETE /api/beacons/:beaconId` - Delete beacon
- `GET /api/beacons/:beaconId/telemetry` - Get telemetry history

### Geofences
- `GET /api/geofences` - List all geofences
- `POST /api/geofences` - Create a new geofence
- `GET /api/geofences/:geofenceId` - Get geofence details
- `PUT /api/geofences/:geofenceId` - Update geofence
- `DELETE /api/geofences/:geofenceId` - Delete geofence

### Sectors
- `GET /api/sectors` - List all sectors
- `POST /api/sectors` - Create a new sector
- `GET /api/sectors/:sectorId` - Get sector details
- `PUT /api/sectors/:sectorId` - Update sector
- `DELETE /api/sectors/:sectorId` - Delete sector

### Health
- `GET /api/health` - Health check endpoint

## WebSocket Events

Connect to `/socket.io/` to receive real-time updates:

- `beacon:state-changed` - Beacon connection state changes
- `beacon:telemetry` - New telemetry data received
- `beacon:power-state-changed` - Beacon power state changes
- `geofence:updated` - Geofence created/updated/deleted

## MQTT Topics

Beacons publish to:
- `beacon/{beaconId}/telemetry` - Telemetry data
- `beacon/{beaconId}/heartbeat` - Heartbeat messages
- `beacon/{beaconId}/status` - Last Will message (offline)

## Architecture

The system follows a layered architecture:
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic layer
- **Repositories**: Data access layer (Prisma)

## Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Environment Variables

See `.env.example` for required environment variables.

## run MQTT inside wsl with

### config
```bash
mkdir -p ~/mosquitto/config && cat > ~/mosquitto/config/mosquitto.conf << EOF
listener 1883 0.0.0.0
allow_anonymous true
log_dest stdout
log_type all
EOF
```

### run
```bash
docker run -it -p 1883:1883 -v ~/mosquitto/config:/mosquitto/config eclipse-mosquitto
```
