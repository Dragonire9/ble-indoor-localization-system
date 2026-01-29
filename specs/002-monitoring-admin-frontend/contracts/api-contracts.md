# API Contracts: Frontend-Backend Integration

**Date**: 2026-01-21
**Feature**: Monitoring and Administrative Management Frontend

## Base URL

- **Development**: `http://localhost:3000` (backend)
- **Production**: TBD (environment variable)

## Authentication

All API endpoints (except `/api/auth/*` and `/api/health`) require authentication via Better Auth session cookie.

### Better Auth Endpoints

- **Base Path**: `/api/auth/*`
- **Handler**: Next.js API route handler using `toNextJsHandler(auth)`
- **Methods**: GET, POST
- **Documentation**: See [Better Auth API](https://www.better-auth.com/docs/concepts/api)

### Session Management

- Session cookie automatically sent with requests
- Frontend uses `authClient.useSession()` hook to check authentication status
- Protected routes redirect to `/login` if unauthenticated

## Beacon Endpoints

### GET /api/beacons

**Description**: Get all beacons with optional filtering

**Query Parameters**:
- `sectorId` (optional, string): Filter by sector ID
- `connectionState` (optional, "ONLINE" | "OFFLINE"): Filter by connection state

**Response**: `200 OK`
```json
[
  {
    "id": "string",
    "beaconId": "string",
    "sectorId": "string",
    "geofenceId": "string | null",
    "powerState": "ON" | "OFF" | "LOW_BATTERY",
    "connectionState": "ONLINE" | "OFFLINE",
    "lastSeenAt": "ISO 8601 date string",
    "registeredAt": "ISO 8601 date string",
    "mqttUsername": "string | null",
    "metadata": "object | null",
    "sector": { /* Sector object */ },
    "geofence": { /* Geofence object | null */ }
  }
]
```

### GET /api/beacons/:beaconId

**Description**: Get beacon by ID

**Path Parameters**:
- `beaconId` (required, string): Beacon ID

**Response**: `200 OK`
```json
{
  "id": "string",
  "beaconId": "string",
  "sectorId": "string",
  "geofenceId": "string | null",
  "powerState": "ON" | "OFF" | "LOW_BATTERY",
  "connectionState": "ONLINE" | "OFFLINE",
  "lastSeenAt": "ISO 8601 date string",
  "registeredAt": "ISO 8601 date string",
  "mqttUsername": "string | null",
  "metadata": "object | null",
  "sector": { /* Sector object */ },
  "geofence": { /* Geofence object | null */ }
}
```

### POST /api/beacons

**Description**: Create new beacon

**Request Body**:
```json
{
  "beaconId": "string",
  "sectorId": "string",
  "geofenceId": "string | null",
  "powerState": "ON" | "OFF" | "LOW_BATTERY",
  "mqttUsername": "string | null",
  "metadata": "object | null"
}
```

**Response**: `201 Created`
```json
{
  "id": "string",
  "beaconId": "string",
  /* ... other fields ... */
}
```

### PUT /api/beacons/:beaconId

**Description**: Update beacon

**Path Parameters**:
- `beaconId` (required, string): Beacon ID

**Request Body**:
```json
{
  "sectorId": "string",
  "geofenceId": "string | null",
  "powerState": "ON" | "OFF" | "LOW_BATTERY",
  "mqttUsername": "string | null",
  "metadata": "object | null"
}
```

**Response**: `200 OK`
```json
{
  "id": "string",
  "beaconId": "string",
  /* ... updated fields ... */
}
```

### DELETE /api/beacons/:beaconId

**Description**: Delete beacon

**Path Parameters**:
- `beaconId` (required, string): Beacon ID

**Response**: `204 No Content`

### GET /api/beacons/:beaconId/telemetry

**Description**: Get beacon telemetry history

**Path Parameters**:
- `beaconId` (required, string): Beacon ID

**Query Parameters**:
- `startDate` (optional, ISO 8601 string): Start date filter
- `endDate` (optional, ISO 8601 string): End date filter
- `limit` (optional, number, default: 100, max: 1000): Number of records to return
- `offset` (optional, number, default: 0): Number of records to skip

**Response**: `200 OK`
```json
[
  {
    "id": "string",
    "beaconId": "string",
    "timestamp": "ISO 8601 date string",
    "rssi": "number | null",
    "batteryLevel": "number | null",
    "powerState": "ON" | "OFF" | "LOW_BATTERY | null",
    "transmissionPower": "number | null",
    "zoneFlags": "string[]",
    "roleFlags": "string[]",
    "message": "string | null",
    "rawData": "object | null"
  }
]
```

## Geofence Endpoints

### GET /api/geofences

**Description**: Get all geofences with optional filtering

**Query Parameters**:
- `sectorId` (optional, string): Filter by sector ID
- `beaconId` (optional, string): Filter by associated beacon ID

**Response**: `200 OK`
```json
[
  {
    "id": "string",
    "sectorId": "string",
    "name": "string | null",
    "coordinates": [
      { "x": "number", "y": "number" }
    ],
    "createdAt": "ISO 8601 date string",
    "updatedAt": "ISO 8601 date string",
    "metadata": "object | null",
    "sector": { /* Sector object */ },
    "beacons": [ /* Beacon objects */ ]
  }
]
```

### GET /api/geofences/:geofenceId

**Description**: Get geofence by ID

**Path Parameters**:
- `geofenceId` (required, string): Geofence ID

**Response**: `200 OK`
```json
{
  "id": "string",
  "sectorId": "string",
  "name": "string | null",
  "coordinates": [
    { "x": "number", "y": "number" }
  ],
  "createdAt": "ISO 8601 date string",
  "updatedAt": "ISO 8601 date string",
  "metadata": "object | null",
  "sector": { /* Sector object */ },
  "beacons": [ /* Beacon objects */ ]
}
```

### POST /api/geofences

**Description**: Create new geofence

**Request Body**:
```json
{
  "sectorId": "string",
  "name": "string | null",
  "coordinates": [
    { "x": "number", "y": "number" }
  ],
  "metadata": "object | null"
}
```

**Response**: `201 Created`
```json
{
  "id": "string",
  "sectorId": "string",
  /* ... other fields ... */
}
```

### PUT /api/geofences/:geofenceId

**Description**: Update geofence

**Path Parameters**:
- `geofenceId` (required, string): Geofence ID

**Request Body**:
```json
{
  "sectorId": "string",
  "name": "string | null",
  "coordinates": [
    { "x": "number", "y": "number" }
  ],
  "metadata": "object | null"
}
```

**Response**: `200 OK`
```json
{
  "id": "string",
  "sectorId": "string",
  /* ... updated fields ... */
}
```

### DELETE /api/geofences/:geofenceId

**Description**: Delete geofence

**Path Parameters**:
- `geofenceId` (required, string): Geofence ID

**Response**: `204 No Content`

## Sector Endpoints

### GET /api/sectors

**Description**: Get all sectors

**Response**: `200 OK`
```json
[
  {
    "id": "string",
    "sectorId": "string",
    "name": "string",
    "description": "string | null",
    "createdAt": "ISO 8601 date string",
    "updatedAt": "ISO 8601 date string",
    "metadata": "object | null",
    "beacons": [ /* Beacon objects */ ],
    "geofences": [ /* Geofence objects */ ]
  }
]
```

### GET /api/sectors/:sectorId

**Description**: Get sector by ID

**Path Parameters**:
- `sectorId` (required, string): Sector ID

**Response**: `200 OK`
```json
{
  "id": "string",
  "sectorId": "string",
  "name": "string",
  "description": "string | null",
  "createdAt": "ISO 8601 date string",
  "updatedAt": "ISO 8601 date string",
  "metadata": "object | null",
  "beacons": [ /* Beacon objects */ ],
  "geofences": [ /* Geofence objects */ ]
}
```

### POST /api/sectors

**Description**: Create new sector

**Request Body**:
```json
{
  "sectorId": "string",
  "name": "string",
  "description": "string | null",
  "metadata": "object | null"
}
```

**Response**: `201 Created`
```json
{
  "id": "string",
  "sectorId": "string",
  /* ... other fields ... */
}
```

### PUT /api/sectors/:sectorId

**Description**: Update sector

**Path Parameters**:
- `sectorId` (required, string): Sector ID

**Request Body**:
```json
{
  "name": "string",
  "description": "string | null",
  "metadata": "object | null"
}
```

**Response**: `200 OK`
```json
{
  "id": "string",
  "sectorId": "string",
  /* ... updated fields ... */
}
```

### DELETE /api/sectors/:sectorId

**Description**: Delete sector

**Path Parameters**:
- `sectorId` (required, string): Sector ID

**Response**:
- `204 No Content` (if deleted successfully)
- `400 Bad Request` (if beacons or geofences still associated)

## WebSocket Events

### Connection

**Endpoint**: `ws://localhost:3000` (Socket.io)

**Events**:

#### `beacon:update`
```json
{
  "type": "beacon:update",
  "data": {
    /* Beacon object */
  }
}
```

#### `beacon:create`
```json
{
  "type": "beacon:create",
  "data": {
    /* Beacon object */
  }
}
```

#### `beacon:delete`
```json
{
  "type": "beacon:delete",
  "data": {
    "beaconId": "string"
  }
}
```

#### `telemetry:new`
```json
{
  "type": "telemetry:new",
  "data": {
    /* BeaconTelemetry object */
    "beaconId": "string"
  }
}
```

#### `geofence:update`
```json
{
  "type": "geofence:update",
  "data": {
    /* Geofence object */
  }
}
```

#### `geofence:create`
```json
{
  "type": "geofence:create",
  "data": {
    /* Geofence object */
  }
}
```

#### `geofence:delete`
```json
{
  "type": "geofence:delete",
  "data": {
    "geofenceId": "string"
  }
}
```

#### `connection:state`
```json
{
  "type": "connection:state",
  "data": {
    "beaconId": "string",
    "connectionState": "ONLINE" | "OFFLINE",
    "lastSeenAt": "ISO 8601 date string"
  }
}
```

## Error Responses

All endpoints may return error responses:

**400 Bad Request**:
```json
{
  "error": {
    "message": "Validation error",
    "code": "VALIDATION_ERROR",
    "details": { /* validation details */ }
  }
}
```

**401 Unauthorized**:
```json
{
  "error": {
    "message": "Unauthorized",
    "code": "UNAUTHORIZED"
  }
}
```

**404 Not Found**:
```json
{
  "error": {
    "message": "Resource not found",
    "code": "NOT_FOUND"
  }
}
```

**500 Internal Server Error**:
```json
{
  "error": {
    "message": "Internal server error",
    "code": "INTERNAL_ERROR"
  }
}
```

## Missing Endpoints (To Be Created)

The following endpoints may need to be created if frontend requires additional data:

1. **GET /api/dashboard/stats** - Dashboard statistics (beacon counts, connection states, etc.)
2. **GET /api/beacons/summary** - Summary view of beacons (lightweight list)
3. **GET /api/geofences/:geofenceId/beacons** - Beacons associated with a geofence

These will be identified during implementation and added to the backend if needed.
