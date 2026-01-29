# Research & Technology Decisions

**Feature**: BLE Beacon Backend System
**Date**: 2025-01-27
**Purpose**: Document technology choices and rationale for implementation decisions

## MQTT Protocol for Beacon Communication

**Decision**: Use MQTT protocol for beacon-to-backend communication

**Rationale**:
- MQTT is the industry standard for IoT device communication
- Lightweight protocol suitable for resource-constrained ESP32 devices
- Built-in QoS levels ensure message delivery reliability
- Supports Last Will and Testament (LWT) for connection state detection
- Efficient publish/subscribe model reduces bandwidth usage
- Works seamlessly over local network or cloud infrastructure

**Alternatives Considered**:
- **HTTP/HTTPS REST API**: Rejected - Too heavy for IoT devices, requires constant polling, higher battery consumption
- **WebSocket**: Rejected - Persistent connections unsuitable for battery-powered devices, higher overhead
- **Custom TCP/UDP Protocol**: Rejected - Requires custom implementation, lacks standard tooling and ecosystem support

**Implementation Notes**:
- Use `mqtt.js` library for Node.js MQTT client
- Per-beacon topic structure: `beacon/{beaconId}/telemetry`
- MQTT QoS level 1 (at least once delivery) for telemetry data
- MQTT Last Will message for offline detection
- Periodic heartbeat messages (e.g., every 30 seconds) for connection health

## MQTT Authentication

**Decision**: MQTT username/password authentication for beacons

**Rationale**:
- Standard MQTT authentication mechanism
- Simple to implement and manage
- Sufficient security for local network deployments
- Can be upgraded to certificate-based auth if needed for cloud deployments

**Alternatives Considered**:
- **No Authentication**: Rejected - Security risk, allows unauthorized devices to publish data
- **Certificate-based Authentication**: Deferred - More complex, can be added later if security requirements increase
- **Beacon ID in Topic**: Rejected - Not secure, topic paths can be guessed

**Implementation Notes**:
- Each beacon configured with unique username/password
- Credentials stored securely in beacon firmware (not in database)
- MQTT broker configured to validate credentials
- Failed authentication attempts logged for security monitoring

## Geofence Coordinate System

**Decision**: Local coordinate system (building-specific X/Y coordinates in meters)

**Rationale**:
- Indoor localization doesn't require GPS coordinates
- Local coordinates are more intuitive for building floor plans
- Easier to work with for indoor mapping and visualization
- No coordinate transformation needed for local displays
- Meters provide appropriate precision for indoor spaces

**Alternatives Considered**:
- **WGS84 (Latitude/Longitude)**: Rejected - Unnecessary complexity for indoor-only system, requires coordinate transformation
- **UTM**: Rejected - Overkill for indoor spaces, adds complexity
- **Mixed System**: Deferred - Can be added if outdoor integration needed

**Implementation Notes**:
- Store coordinates as array of {x, y} points in meters
- Origin point (0,0) defined per building/floor
- Polygon validation ensures closed shapes (first point = last point)
- Coordinate system metadata stored with geofence for reference

## Connection State Detection

**Decision**: MQTT Last Will and Testament (LWT) + periodic heartbeat messages

**Rationale**:
- MQTT LWT automatically publishes offline message when connection drops unexpectedly
- Periodic heartbeat provides regular health check
- Combination ensures reliable state detection
- Standard MQTT pattern, well-supported by brokers

**Alternatives Considered**:
- **Timeout-based Only**: Rejected - Less reliable, doesn't detect abrupt disconnections immediately
- **MQTT Connection Events Only**: Rejected - Doesn't detect network issues where connection appears active but no data flows
- **Hybrid Approach**: Selected - Combines best of both approaches

**Implementation Notes**:
- Heartbeat interval: 30 seconds (configurable)
- LWT topic: `beacon/{beaconId}/status` with payload `offline`
- Heartbeat topic: `beacon/{beaconId}/heartbeat` with timestamp
- Backend tracks last heartbeat timestamp, considers offline if >60 seconds elapsed

## Database: MongoDB with Prisma

**Decision**: MongoDB with Prisma ORM

**Rationale**:
- Constitution requirement: MongoDB with Prisma
- MongoDB's document model suits flexible telemetry data structure
- Prisma provides type safety and prevents N+1 queries
- Good performance for time-series telemetry data
- Supports geospatial queries if needed for geofence filtering

**Implementation Notes**:
- Use Prisma's MongoDB connector
- Explicit ObjectId mapping: `@id @map("_id") @db.ObjectId`
- Indexes on: beaconId (telemetry), sectorId (beacons), connectionState (beacons)
- Compound indexes for common query patterns

## WebSocket Library: Socket.io

**Decision**: Socket.io for WebSocket server

**Rationale**:
- Industry standard for Node.js WebSocket implementation
- Automatic fallback to polling if WebSocket unavailable
- Built-in room/namespace support for broadcasting
- Easy integration with Express.js
- Good TypeScript support

**Alternatives Considered**:
- **ws (native WebSocket)**: Rejected - Lower-level, requires more manual implementation
- **SockJS**: Rejected - Less popular, smaller ecosystem

**Implementation Notes**:
- Use Socket.io namespaces for different update types
- Room-based broadcasting for efficient message distribution
- Connection state management for reconnection handling

## Validation: Zod

**Decision**: Zod for input validation

**Rationale**:
- Constitution requirement: Zod or Joi
- Zod provides TypeScript type inference
- Better developer experience with TypeScript
- Runtime validation with compile-time types
- Active development and good documentation

**Implementation Notes**:
- All API endpoints validate input with Zod schemas
- MQTT message payloads validated before processing
- Geofence polygon coordinates validated for format and validity
- Validation errors return structured error responses

## Logging: Winston

**Decision**: Winston for structured logging

**Rationale**:
- Constitution requirement: Winston or Pino
- Mature, widely-used logging library
- Supports multiple transports (console, file, remote)
- Structured logging format (JSON)
- Good performance

**Implementation Notes**:
- Structured logging format (JSON)
- Log levels: error, warn, info, debug
- Separate transports for different environments
- No console.error in production code

## Testing: Jest

**Decision**: Jest for unit and integration testing

**Rationale**:
- Standard Node.js testing framework
- Good TypeScript support
- Built-in mocking capabilities
- Supertest integration for API testing
- Good ecosystem and documentation

**Implementation Notes**:
- Unit tests for services and utilities
- Integration tests for API endpoints
- Mock MQTT client and WebSocket server in tests
- Test database setup/teardown for integration tests
