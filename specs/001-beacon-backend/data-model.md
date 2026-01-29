# Data Model

**Feature**: BLE Beacon Backend System
**Date**: 2025-01-27
**Database**: MongoDB with Prisma ORM

## Overview

The data model consists of four core entities: Beacon, BeaconTelemetry, Geofence, and Sector. These entities support the indoor localization system by tracking beacon devices, their telemetry data, spatial boundaries (geofences), and logical zones (sectors).

## Entities

### Beacon

Represents a physical ESP32 beacon device in the system.

**Attributes**:
- `id` (String, unique, required): Unique beacon identifier (matches MQTT topic beacon ID)
- `sectorId` (String, required): Reference to Sector entity
- `geofenceId` (String, optional): Reference to Geofence entity (beacon's associated geofence)
- `powerState` (Enum: ON, OFF, LOW_BATTERY, required): Current power state of the beacon
- `connectionState` (Enum: ONLINE, OFFLINE, required): Current MQTT connection state
- `lastSeenAt` (DateTime, required): Timestamp of last received telemetry or heartbeat
- `registeredAt` (DateTime, required): Timestamp when beacon was registered in system
- `mqttUsername` (String, optional): MQTT authentication username (stored for reference, not used for auth)
- `metadata` (JSON, optional): Additional configuration or metadata

**Relationships**:
- `belongsTo` Sector (many-to-one)
- `hasMany` BeaconTelemetry (one-to-many)
- `belongsTo` Geofence (many-to-one, optional)

**Validation Rules**:
- `id` must be unique across all beacons
- `id` must match MQTT topic pattern (alphanumeric, no special chars)
- `connectionState` defaults to OFFLINE on creation
- `lastSeenAt` must be updated on each telemetry receipt or heartbeat

**Indexes**:
- Primary: `id` (unique)
- Index: `sectorId`
- Index: `connectionState`
- Index: `geofenceId`
- Compound: `{sectorId, connectionState}` (for sector-based queries)

**State Transitions**:
- `connectionState`: OFFLINE → ONLINE (on first telemetry/heartbeat), ONLINE → OFFLINE (on LWT or timeout)
- `powerState`: ON → LOW_BATTERY (when battery < threshold), LOW_BATTERY → OFF (when battery depleted)

### BeaconTelemetry

Represents a single data transmission from a beacon.

**Attributes**:
- `id` (ObjectId, unique, required): MongoDB-generated unique identifier
- `beaconId` (String, required): Reference to Beacon entity
- `timestamp` (DateTime, required): When telemetry was received by backend
- `rssi` (Number, optional): Received Signal Strength Indicator value
- `batteryLevel` (Number, optional): Battery level percentage (0-100)
- `powerState` (Enum: ON, OFF, LOW_BATTERY, optional): Power state at time of transmission
- `transmissionPower` (Number, optional): Transmission power (Tx) value
- `zoneFlags` (String[], optional): Array of zone identifiers from beacon broadcast
- `roleFlags` (String[], optional): Array of role identifiers from beacon broadcast
- `message` (String, optional): Optional message content from beacon (23-character format mentioned in spec)
- `rawData` (JSON, optional): Raw advertisement packet data for debugging/analysis

**Relationships**:
- `belongsTo` Beacon (many-to-one)

**Validation Rules**:
- `beaconId` must reference existing Beacon
- `timestamp` must be current time or recent past (within 5 minutes)
- `batteryLevel` must be between 0 and 100 if provided
- `rssi` typically ranges from -100 to 0 dBm

**Indexes**:
- Primary: `id` (ObjectId)
- Index: `beaconId`
- Index: `timestamp` (descending, for time-series queries)
- Compound: `{beaconId, timestamp}` (for beacon-specific time-series queries)
- TTL Index: `timestamp` (for data retention - TBD based on retention policy)

**Data Retention**:
- Historical telemetry data retention policy TBD (may implement time-based cleanup or archival)

### Geofence

Represents a polygon boundary defining a zone or sector area.

**Attributes**:
- `id` (ObjectId, unique, required): MongoDB-generated unique identifier
- `sectorId` (String, required): Reference to Sector entity
- `name` (String, optional): Human-readable name for the geofence
- `coordinates` (Array of {x: Number, y: Number}, required): Array of coordinate points forming polygon
- `createdAt` (DateTime, required): Timestamp when geofence was created
- `updatedAt` (DateTime, required): Timestamp when geofence was last modified
- `metadata` (JSON, optional): Additional geofence metadata

**Relationships**:
- `belongsTo` Sector (many-to-one)
- `hasMany` Beacons (one-to-many, via beacon.geofenceId)

**Validation Rules**:
- `coordinates` must contain at least 3 points (minimum polygon)
- First and last coordinate points must be identical (closed polygon)
- Coordinates must be in local X/Y meters format
- Polygon must not self-intersect
- `sectorId` must reference existing Sector

**Indexes**:
- Primary: `id` (ObjectId)
- Index: `sectorId`
- Geospatial Index: `coordinates` (for spatial queries if MongoDB geospatial features used)

**Coordinate Format**:
- Each coordinate point: `{x: Number, y: Number}` where x and y are in meters
- Example: `[{x: 0, y: 0}, {x: 10, y: 0}, {x: 10, y: 10}, {x: 0, y: 10}, {x: 0, y: 0}]`
- Origin (0,0) defined per building/floor

### Sector

Represents a logical zone or area in the indoor space.

**Attributes**:
- `id` (String, unique, required): Unique sector identifier
- `name` (String, required): Human-readable sector name
- `description` (String, optional): Description of the sector
- `createdAt` (DateTime, required): Timestamp when sector was created
- `updatedAt` (DateTime, required): Timestamp when sector was last modified
- `metadata` (JSON, optional): Additional sector metadata

**Relationships**:
- `hasMany` Beacons (one-to-many)
- `hasOne` Geofence (one-to-one, via geofence.sectorId)

**Validation Rules**:
- `id` must be unique across all sectors
- `name` is required and must be non-empty

**Indexes**:
- Primary: `id` (unique)
- Index: `name` (for search/filtering)

## Entity Relationships Diagram

```
Sector (1) ──< (many) Beacon
Sector (1) ──< (1) Geofence
Beacon (1) ──< (many) BeaconTelemetry
Geofence (1) ──< (many) Beacon (via geofenceId)
```

## Database Schema Considerations

### Prisma Schema Structure

- Use `@id @map("_id") @db.ObjectId` for MongoDB ObjectId fields
- Use `@relation` for relationships
- Use `@index` for performance optimization
- Use `@default` for default values (e.g., connectionState = OFFLINE)

### Query Optimization

- Avoid N+1 queries: Use Prisma `include` for eager loading related entities
- Use `select` to fetch only required fields
- Batch queries using `in` operator for multiple beacon lookups
- Use compound indexes for common query patterns

### Data Integrity

- Foreign key constraints enforced at application level (Prisma)
- Unique constraints on `beacon.id` and `sector.id`
- Validation at service layer before database writes
- Transaction support for multi-entity operations

## Migration Strategy

- Initial schema creation via Prisma migrations
- Future schema changes via incremental migrations
- Data migration scripts for coordinate system changes if needed
- Backup strategy before major schema changes
