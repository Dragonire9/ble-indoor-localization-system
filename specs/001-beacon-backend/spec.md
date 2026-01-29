# Feature Specification: BLE Beacon Backend System

**Feature Branch**: `001-beacon-backend`
**Created**: 2025-01-27
**Status**: Draft
**Input**: User description: "we want to start developing the backend of this project to see what we need and end up with, as per the beacons and how they should connect to our server ( backend ) on local network or cloud. Don't forget we need the backend to store polygons as Geofence so we can serve them to our frontend. our frontend will be just for monitoring so the backend should use sockets to connect with frontend in realtime. take into consideration that every detail about the beacon should be stored in database ( like  id, assigend sector, geofence, power state, connection state, etc. ). also the database should store all information coming from beacons, each information should be linked to the beacon it came from."

## Clarifications

### Session 2025-01-27

- Q: How do beacons establish connections and send data to the backend? → A: MQTT protocol - Beacons publish telemetry to MQTT broker, backend subscribes
- Q: What coordinate system should be used for geofence polygons? → A: Local coordinate system - Building-specific X/Y coordinates in meters
- Q: How should MQTT topics be organized for beacon telemetry? → A: Per-beacon topics - Each beacon publishes to its own topic (e.g., `beacon/{beaconId}/telemetry`)
- Q: How should the backend detect if a beacon is online or offline? → A: MQTT Last Will + heartbeat - Beacons publish periodic heartbeat, Last Will message on disconnect
- Q: Do beacons authenticate when connecting to the MQTT broker? → A: MQTT username/password - Beacons authenticate with credentials

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Beacon Connection and Data Reception (Priority: P1)

Administrators need the backend to accept connections from BLE beacons (ESP32 devices) over local network or cloud via MQTT protocol, receive their telemetry data published to MQTT topics, and persistently store all received information linked to the originating beacon.

**Why this priority**: This is the foundational capability - without beacon connections and data storage, no other functionality is possible. This enables the core value proposition of the system.

**Independent Test**: Can be fully tested by simulating beacon connections sending telemetry data and verifying that all data is stored in the database with proper beacon linkage. Delivers the ability to collect and persist beacon information.

**Acceptance Scenarios**:

1. **Given** a beacon is configured to connect to the MQTT broker, **When** the beacon publishes telemetry data to its per-beacon MQTT topic (e.g., `beacon/{beaconId}/telemetry`) (local network or cloud), **Then** the backend subscribes to the topic, receives the data, and records the connection state
2. **Given** a beacon publishing to MQTT topics, **When** the beacon sends telemetry data (RSSI, battery level, power state, etc.) via MQTT publish, **Then** the backend receives the message, stores all received data in the database with a link to the source beacon
3. **Given** multiple beacons are connected, **When** each beacon sends data simultaneously, **Then** the backend correctly associates each data record with its originating beacon using beacon ID extracted from MQTT topic path
4. **Given** a beacon loses connection, **When** the connection is restored, **Then** the backend updates the connection state and continues receiving data

---

### User Story 2 - Beacon Management and Configuration (Priority: P2)

Administrators need to register, configure, and manage beacon details including unique ID, assigned sector, geofence assignment, power state, and connection status in the database.

**Why this priority**: Beacon management enables administrators to organize and track the physical infrastructure. This must be available before real-time monitoring can provide meaningful information.

**Independent Test**: Can be fully tested by creating, updating, and querying beacon records through administrative interfaces. Delivers the ability to manage beacon inventory and configuration.

**Acceptance Scenarios**:

1. **Given** an administrator wants to register a new beacon, **When** they provide beacon details (ID, sector, initial configuration), **Then** the system stores the beacon record with all specified attributes
2. **Given** an existing beacon record, **When** an administrator updates the assigned sector or geofence, **Then** the system updates the beacon record and maintains historical association
3. **Given** multiple beacons exist in the system, **When** an administrator queries beacon status, **Then** the system returns current power state, connection state, and other stored details for all beacons
4. **Given** a beacon is assigned to a sector, **When** the administrator views beacon details, **Then** the system displays the sector assignment and related geofence information

---

### User Story 3 - Geofence Storage and Serving (Priority: P2)

Administrators need to store polygon-based geofences in the database and serve them to the frontend monitoring application for display on maps.

**Why this priority**: Geofences define the spatial boundaries for sectors and zones. The frontend monitoring dashboard requires geofence data to visualize beacon locations and coverage areas.

**Independent Test**: Can be fully tested by creating geofence polygons, storing them, and retrieving them via API endpoints. Delivers the ability to define and serve spatial boundaries to the frontend.

**Acceptance Scenarios**:

1. **Given** an administrator wants to define a geofence, **When** they provide polygon coordinates, **Then** the system stores the geofence geometry in the database
2. **Given** stored geofences exist, **When** the frontend requests geofence data, **Then** the system returns all geofences with their polygon coordinates
3. **Given** a geofence is associated with a beacon, **When** the frontend requests beacon details, **Then** the system includes the associated geofence polygon in the response
4. **Given** multiple geofences exist, **When** the frontend requests geofences for a specific area, **Then** the system can filter and return relevant geofences

---

### User Story 4 - Real-time Monitoring via WebSockets (Priority: P3)

Frontend monitoring application needs to receive real-time updates about beacon status, connection states, and telemetry data through socket connections without polling.

**Why this priority**: Real-time updates provide immediate visibility into system state, but the system can function with polling as an alternative. This enhances user experience for monitoring dashboards.

**Independent Test**: Can be fully tested by establishing a socket connection from a frontend client and verifying that beacon state changes and new telemetry data are pushed in real-time. Delivers live monitoring capabilities without constant polling.

**Acceptance Scenarios**:

1. **Given** a frontend monitoring application, **When** it establishes a socket connection to the backend, **Then** the backend accepts the connection and begins streaming updates
2. **Given** an active socket connection, **When** a beacon's connection state changes (online/offline), **Then** the backend immediately pushes the state change to all connected frontend clients
3. **Given** an active socket connection, **When** a beacon sends new telemetry data, **Then** the backend pushes the new data to all connected frontend clients in real-time
4. **Given** multiple frontend clients are connected, **When** beacon state changes occur, **Then** all connected clients receive the same updates simultaneously
5. **Given** a frontend client loses connection, **When** it reconnects, **Then** the backend resumes pushing real-time updates

---

### Edge Cases

- What happens when a beacon sends malformed or invalid data?
- How does the system handle beacons connecting with duplicate IDs?
- What happens when a beacon provides invalid MQTT credentials?
- What happens when the database is temporarily unavailable during beacon data transmission? (Resolution: Telemetry data is queued in memory/buffer, retried with exponential backoff until database is available)
- How does the system handle high-frequency data from multiple beacons simultaneously? (Threshold: >100 messages/second per beacon requires rate limiting or batching)
- What happens when a geofence polygon has invalid coordinates or self-intersecting geometry?
- How does the system handle socket connection failures or network interruptions?
- What happens when a beacon's connection state cannot be determined?
- How does the system handle beacons that stop sending heartbeat messages but remain connected?
- What happens when a beacon's Last Will message is received but heartbeat messages continue?
- How does the system handle beacons that connect but never send data?
- What happens when geofence data is requested but no geofences exist?
- How does the system handle concurrent updates to the same beacon record? (Resolution: Last-write-wins strategy - most recent update timestamp wins)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept connections from BLE beacons over local network or cloud infrastructure via MQTT protocol (beacons publish to per-beacon topics like `beacon/{beaconId}/telemetry`, backend subscribes to these topics)
- **FR-019**: System MUST require MQTT username/password authentication for beacons connecting to the MQTT broker
- **FR-002**: System MUST store all telemetry data received from beacons with a link to the originating beacon
- **FR-003**: System MUST persist beacon details including: unique ID, assigned sector, geofence assignment, power state, and connection state
- **FR-004**: System MUST store polygon-based geofences with coordinate data using local coordinate system (building-specific X/Y coordinates in meters)
- **FR-005**: System MUST serve geofence data to frontend applications via API endpoints
- **FR-006**: System MUST establish and maintain WebSocket connections with frontend monitoring clients
- **FR-007**: System MUST push real-time updates to connected frontend clients when beacon states change
- **FR-008**: System MUST push real-time updates to connected frontend clients when new beacon telemetry data is received
- **FR-009**: System MUST track and update beacon connection state (online/offline) in real-time using MQTT Last Will messages and periodic heartbeat messages from beacons
- **FR-010**: System MUST associate all received beacon data with the correct beacon record using beacon ID (extracted from MQTT topic path or message payload)
- **FR-011**: System MUST support multiple beacons connecting and sending data concurrently
- **FR-012**: System MUST support multiple frontend clients connected via sockets simultaneously
- **FR-013**: System MUST validate beacon data before storage
- **FR-014**: System MUST validate geofence polygon coordinates before storage (ensure coordinates are in local X/Y meters format and polygon is valid)
- **FR-015**: System MUST handle beacon connection failures gracefully without data loss. During database unavailability, telemetry data MUST be queued/buffered and retried with exponential backoff until successfully stored
- **FR-016**: System MUST maintain historical records of all beacon telemetry data
- **FR-017**: System MUST allow querying beacon records by ID, sector, or connection state
- **FR-018**: System MUST allow querying geofences by associated beacon or geographic area

### Key Entities *(include if feature involves data)*

- **Beacon**: Represents a physical ESP32 beacon device. Key attributes: unique ID, assigned sector identifier, associated geofence reference, current power state, current connection state (online/offline), registration timestamp, last seen timestamp. Relationships: has many BeaconTelemetry records, belongs to one Sector, associated with one Geofence.

- **BeaconTelemetry**: Represents a single data transmission from a beacon. Key attributes: timestamp, RSSI values, battery level, power state, transmission power (Tx), optional metadata (zone flags, role flags, messages), raw advertisement packet data. Relationships: belongs to one Beacon.

- **Geofence**: Represents a polygon boundary defining a zone or sector area. Key attributes: unique identifier, polygon coordinates (array of coordinate points in local X/Y meters), associated sector identifier, creation timestamp. Relationships: can be associated with multiple Beacons, belongs to one Sector.

- **Sector**: Represents a logical zone or area in the indoor space. Key attributes: unique identifier, name, description. Relationships: has many Beacons, has one Geofence.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: System successfully receives and stores data from at least 100 concurrent beacon connections without data loss
- **SC-002**: Beacon telemetry data is stored in the database within 1 second of reception
- **SC-003**: Frontend monitoring clients receive real-time updates within 500 milliseconds of beacon state changes
- **SC-004**: System maintains 99% uptime for beacon connections during normal operation
- **SC-005**: Administrators can retrieve all beacon records and their current status in under 2 seconds
- **SC-006**: Frontend applications can retrieve all geofence polygons in under 1 second
- **SC-007**: System correctly associates 100% of received telemetry data with the correct beacon record
- **SC-008**: System supports at least 10 concurrent frontend socket connections without performance degradation
- **SC-009**: All beacon connection state changes are reflected in the database and pushed to frontend clients within 1 second
- **SC-010**: Geofence polygons are stored and retrieved with coordinate accuracy preserved (local X/Y meters coordinate system maintained)
