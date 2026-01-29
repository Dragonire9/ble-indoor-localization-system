# Data Model: Frontend

**Date**: 2026-01-21
**Feature**: Monitoring and Administrative Management Frontend

## Overview

The frontend consumes data from the backend REST API and WebSocket server. Data models are derived from the backend Prisma schema and API responses.

## Core Entities

### User (Better Auth)

**Source**: Better Auth session
**Fields**:
- `id`: string (user ID)
- `email`: string
- `name`: string | null
- `image`: string | null
- `emailVerified`: boolean
- `createdAt`: Date
- `updatedAt`: Date

**Relationships**: None (managed by Better Auth)

### Beacon

**Source**: Backend API `/api/beacons`
**Fields**:
- `id`: string (MongoDB ObjectId)
- `beaconId`: string (unique identifier)
- `sectorId`: string
- `geofenceId`: string | null (MongoDB ObjectId)
- `powerState`: "ON" | "OFF" | "LOW_BATTERY"
- `connectionState`: "ONLINE" | "OFFLINE"
- `lastSeenAt`: Date
- `registeredAt`: Date
- `mqttUsername`: string | null
- `metadata`: Record<string, unknown> | null
- `sector`: Sector (nested, from API)
- `geofence`: Geofence | null (nested, from API)

**Relationships**:
- Belongs to one Sector
- Associated with one Geofence (optional)
- Has many BeaconTelemetry records

**Frontend Display**:
- Unique ID, assigned sector, associated geofence
- Power state (ON/OFF/LOW_BATTERY)
- Connection state (ONLINE/OFFLINE)
- Last seen timestamp
- Battery level (from latest telemetry)
- Recent telemetry data

### BeaconTelemetry

**Source**: Backend API `/api/beacons/:beaconId/telemetry`
**Fields**:
- `id`: string (MongoDB ObjectId)
- `beaconId`: string
- `timestamp`: Date
- `rssi`: number | null
- `batteryLevel`: number | null
- `powerState`: "ON" | "OFF" | "LOW_BATTERY" | null
- `transmissionPower`: number | null
- `zoneFlags`: string[]
- `roleFlags`: string[]
- `message`: string | null
- `rawData`: Record<string, unknown> | null

**Relationships**:
- Belongs to one Beacon

**Frontend Display**:
- Timestamp, RSSI, battery level
- Power state, transmission power
- Zone flags, role flags
- Message content

### Geofence

**Source**: Backend API `/api/geofences`
**Fields**:
- `id`: string (MongoDB ObjectId)
- `sectorId`: string
- `name`: string | null
- `coordinates`: Array<{ x: number; y: number }> (local X/Y meters)
- `createdAt`: Date
- `updatedAt`: Date
- `metadata`: Record<string, unknown> | null
- `sector`: Sector (nested, from API)
- `beacons`: Beacon[] (nested, from API)

**Relationships**:
- Belongs to one Sector
- Associated with multiple Beacons

**Frontend Display**:
- Unique identifier
- Polygon coordinates (local X/Y meters)
- Associated sector
- Associated beacons
- Name

**Coordinate System**:
- Local coordinate system (building-specific X/Y meters)
- Not geographic coordinates
- Array of coordinate points: `[{x: 0, y: 0}, {x: 10, y: 0}, {x: 10, y: 10}, {x: 0, y: 10}]`

### Sector

**Source**: Backend API `/api/sectors`
**Fields**:
- `id`: string (MongoDB ObjectId)
- `sectorId`: string (unique identifier)
- `name`: string
- `description`: string | null
- `createdAt`: Date
- `updatedAt`: Date
- `metadata`: Record<string, unknown> | null
- `beacons`: Beacon[] (nested, from API)
- `geofences`: Geofence[] (nested, from API)

**Relationships**:
- Has many Beacons
- Has many Geofences

**Frontend Display**:
- Unique identifier
- Name, description
- Associated beacon count
- Associated geofence count

## API Response Types

### List Responses

All list endpoints return paginated responses:

```typescript
type PaginatedResponse<T> = {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
```

### Error Responses

```typescript
type ErrorResponse = {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};
```

## WebSocket Event Types

### Beacon Events

```typescript
type BeaconUpdateEvent = {
  type: 'beacon:update' | 'beacon:create' | 'beacon:delete';
  data: Beacon;
};

type BeaconTelemetryEvent = {
  type: 'telemetry:new';
  data: BeaconTelemetry & { beaconId: string };
};
```

### Geofence Events

```typescript
type GeofenceUpdateEvent = {
  type: 'geofence:update' | 'geofence:create' | 'geofence:delete';
  data: Geofence;
};
```

### Connection Events

```typescript
type ConnectionEvent = {
  type: 'connection:state';
  data: {
    beaconId: string;
    connectionState: 'ONLINE' | 'OFFLINE';
    lastSeenAt: Date;
  };
};
```

## Form Input Types

### Create Beacon

```typescript
type CreateBeaconInput = {
  beaconId: string;
  sectorId: string;
  geofenceId?: string;
  powerState?: 'ON' | 'OFF' | 'LOW_BATTERY';
  mqttUsername?: string;
  metadata?: Record<string, unknown>;
};
```

### Update Beacon

```typescript
type UpdateBeaconInput = {
  sectorId?: string;
  geofenceId?: string | null;
  powerState?: 'ON' | 'OFF' | 'LOW_BATTERY';
  mqttUsername?: string;
  metadata?: Record<string, unknown>;
};
```

### Create Geofence

```typescript
type CreateGeofenceInput = {
  sectorId: string;
  name?: string;
  coordinates: Array<{ x: number; y: number }>; // Minimum 3 points
  metadata?: Record<string, unknown>;
};
```

### Update Geofence

```typescript
type UpdateGeofenceInput = {
  sectorId?: string;
  name?: string;
  coordinates?: Array<{ x: number; y: number }>; // Minimum 3 points
  metadata?: Record<string, unknown>;
};
```

### Create Sector

```typescript
type CreateSectorInput = {
  sectorId: string;
  name: string;
  description?: string;
  metadata?: Record<string, unknown>;
};
```

### Update Sector

```typescript
type UpdateSectorInput = {
  name?: string;
  description?: string;
  metadata?: Record<string, unknown>;
};
```

### Telemetry Filter

```typescript
type TelemetryFilter = {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
};
```

## Validation Rules

### Beacon
- `beaconId`: Required, string, unique
- `sectorId`: Required, string, must exist in sectors
- `geofenceId`: Optional, string, must exist in geofences if provided

### Geofence
- `sectorId`: Required, string, must exist in sectors
- `coordinates`: Required, array of at least 3 coordinate points
- Each coordinate point: `{ x: number, y: number }`

### Sector
- `sectorId`: Required, string, unique
- `name`: Required, string, min 1 character

### Telemetry Filter
- `startDate`: Optional, must be valid Date
- `endDate`: Optional, must be valid Date, must be after startDate if both provided
- `limit`: Optional, number, min 1, max 1000, default 100
- `offset`: Optional, number, min 0, default 0

## State Transitions

### Beacon Connection State
- `OFFLINE` → `ONLINE`: When beacon sends telemetry or connects via MQTT
- `ONLINE` → `OFFLINE`: When beacon Last Will message received or timeout

### Beacon Power State
- `ON` → `OFF`: Manual update or beacon reports OFF
- `ON` → `LOW_BATTERY`: When battery level drops below threshold
- `LOW_BATTERY` → `ON`: When battery level recovers above threshold
- `LOW_BATTERY` → `OFF`: Manual update or beacon reports OFF

## Empty States

### No Beacons
- Display: Empty state component with message "No beacons registered"
- Action: "Create Beacon" button

### No Geofences
- Display: Empty state component with message "No geofences defined"
- Action: "Create Geofence" button

### No Sectors
- Display: Empty state component with message "No sectors defined"
- Action: "Create Sector" button

### No Telemetry
- Display: Empty state component with message "No telemetry data available"
- Action: None (informational only)
