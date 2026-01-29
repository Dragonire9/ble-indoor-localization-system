# WebSocket API Contract

**Feature**: BLE Beacon Backend System
**Protocol**: Socket.io over WebSocket
**Purpose**: Real-time updates for frontend monitoring clients

## Connection

**Endpoint**: `/socket.io/`
**Transport**: WebSocket (with polling fallback)

### Connection Events

#### Client → Server: `connect`
Client establishes connection to WebSocket server.

**Response**: Server acknowledges connection and sends initial state.

#### Client → Server: `subscribe:beacons`
Client subscribes to beacon updates.

**Payload**: None

**Response**: Server confirms subscription and sends current beacon states.

#### Client → Server: `subscribe:telemetry`
Client subscribes to telemetry updates for specific beacon(s).

**Payload**:
```json
{
  "beaconIds": ["beacon-001", "beacon-002"] // Array of beacon IDs, empty array = all beacons
}
```

**Response**: Server confirms subscription.

#### Client → Server: `disconnect`
Client disconnects from WebSocket server.

## Server → Client Events

### `beacon:state-changed`
Emitted when a beacon's connection state changes (online/offline).

**Payload**:
```json
{
  "beaconId": "beacon-001",
  "connectionState": "ONLINE" | "OFFLINE",
  "timestamp": "2025-01-27T10:30:00Z"
}
```

### `beacon:telemetry`
Emitted when new telemetry data is received from a beacon.

**Payload**:
```json
{
  "beaconId": "beacon-001",
  "telemetry": {
    "timestamp": "2025-01-27T10:30:00Z",
    "rssi": -65,
    "batteryLevel": 85,
    "powerState": "ON",
    "transmissionPower": 0,
    "zoneFlags": ["zone-a"],
    "roleFlags": ["entrance"],
    "message": null
  }
}
```

### `beacon:power-state-changed`
Emitted when a beacon's power state changes.

**Payload**:
```json
{
  "beaconId": "beacon-001",
  "powerState": "LOW_BATTERY" | "ON" | "OFF",
  "timestamp": "2025-01-27T10:30:00Z"
}
```

### `geofence:updated`
Emitted when a geofence is created, updated, or deleted.

**Payload**:
```json
{
  "action": "created" | "updated" | "deleted",
  "geofenceId": "geofence-001",
  "geofence": { /* Geofence object or null if deleted */ },
  "timestamp": "2025-01-27T10:30:00Z"
}
```

## Namespaces

All events are emitted in the default namespace (`/`).

## Room Management

- Clients can join rooms for filtered updates (future enhancement)
- Current implementation broadcasts to all connected clients

## Error Handling

### Connection Errors

If connection fails, client should:
1. Retry connection with exponential backoff
2. Fall back to polling API if WebSocket unavailable

### Event Errors

Server may emit `error` event with error details:
```json
{
  "code": "SUBSCRIPTION_ERROR",
  "message": "Invalid beacon ID",
  "details": {}
}
```

## Performance Considerations

- Events are batched when possible (multiple state changes in short time)
- Clients should throttle reconnection attempts
- Server limits concurrent connections (configurable, default: 100)
