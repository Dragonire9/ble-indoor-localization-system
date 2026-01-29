# Implementation Plan: BLE Beacon Backend System

**Branch**: `001-beacon-backend` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-beacon-backend/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a Node.js backend system that receives telemetry data from BLE beacons (ESP32 devices) via MQTT protocol, stores beacon configurations and telemetry data in MongoDB, manages geofence polygons for indoor localization zones, and provides real-time updates to frontend monitoring clients via WebSockets. The system follows a layered architecture (Controllers → Services → Repositories) using Prisma ORM with MongoDB, ensuring strict separation of concerns and optimal database performance.

## Technical Context

**Language/Version**: Node.js 18+ (LTS) with TypeScript 5.0+ (strict mode enabled)
**Primary Dependencies**: Express.js (HTTP API), MQTT.js (MQTT client), Socket.io (WebSocket), Prisma (ORM), Zod (validation), Winston (logging)
**Storage**: MongoDB with Prisma ORM (explicit ObjectId mapping)
**Testing**: Jest (unit/integration), Supertest (API testing)
**Target Platform**: Linux server (local network or cloud deployment)
**Project Type**: Backend API server (part of web application architecture)
**Performance Goals**:
- Handle 100+ concurrent beacon connections
- Store telemetry data within 1 second of reception
- Push real-time updates to frontend within 500ms
- Support 10+ concurrent WebSocket connections
- Query beacon/geofence data in under 2 seconds
**Constraints**:
- 99% uptime requirement for beacon connections
- No N+1 database queries (constitution requirement)
- All input validation before service layer
- Structured logging required (no console.error in production)
**Scale/Scope**:
- 100+ beacons publishing telemetry data
- Historical telemetry data storage (retention policy TBD)
- Multiple frontend monitoring clients
- Geofence polygons with local coordinate system (X/Y meters)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Compliance

✅ **Layered Architecture**: Plan follows Controller → Service → Repository pattern
✅ **SOLID Principles**: Services use dependency injection, single responsibility per layer
✅ **Database Performance**: Prisma with MongoDB, will use `include` and batch queries to avoid N+1
✅ **Security**: MQTT authentication (username/password), JWT for admin API (if needed)
✅ **Error Handling**: Global error handler middleware, structured logging with Winston
✅ **Type Safety**: TypeScript strict mode, Zod validation for all inputs
✅ **Code Quality**: DRY principles, selective fetching with Prisma `select`, proper indexing

### Post-Design Re-check

✅ **Layered Architecture**: Data model and API contracts follow Controller → Service → Repository pattern
✅ **SOLID Principles**: Services designed with dependency injection, single responsibility per layer
✅ **Database Performance**: Prisma schema includes proper indexes, relationships use `include` pattern to avoid N+1
✅ **Security**: MQTT authentication specified, input validation with Zod schemas, admin API authentication required (JWT per constitution IV)
✅ **Error Handling**: Global error handler middleware planned, structured logging with Winston
✅ **Type Safety**: TypeScript strict mode, Zod validation schemas for all inputs
✅ **Code Quality**: Repository pattern prevents code duplication, selective fetching with Prisma `select` planned, indexes defined in data model

## Project Structure

### Documentation (this feature)

```text
specs/001-beacon-backend/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── controllers/          # HTTP request handlers (no business logic)
│   │   ├── beacon.controller.ts
│   │   ├── geofence.controller.ts
│   │   └── sector.controller.ts
│   ├── services/             # Business logic layer
│   │   ├── beacon.service.ts
│   │   ├── geofence.service.ts
│   │   ├── mqtt.service.ts    # MQTT message handling
│   │   └── websocket.service.ts  # WebSocket broadcasting
│   ├── repositories/          # Data access layer (Prisma)
│   │   ├── beacon.repository.ts
│   │   ├── telemetry.repository.ts
│   │   ├── geofence.repository.ts
│   │   └── sector.repository.ts
│   ├── middleware/            # Express middleware
│   │   ├── error-handler.middleware.ts
│   │   ├── auth.middleware.ts  # Admin API authentication required per constitution IV (JWT with short expiry)
│   │   └── validation.middleware.ts
│   ├── lib/                   # Utilities
│   │   ├── logger.ts          # Winston logger setup
│   │   ├── mqtt-client.ts     # MQTT client initialization
│   │   └── websocket-server.ts # Socket.io server setup
│   ├── types/                 # TypeScript types
│   │   ├── beacon.types.ts
│   │   ├── geofence.types.ts
│   │   └── mqtt.types.ts
│   ├── schemas/               # Zod validation schemas
│   │   ├── beacon.schema.ts
│   │   ├── geofence.schema.ts
│   │   └── telemetry.schema.ts
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── prisma/
│   ├── schema.prisma          # Prisma schema definition
│   └── migrations/            # Database migrations
├── tests/
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── contract/              # Contract tests
└── package.json
```

**Structure Decision**: Backend-only project structure following constitution's layered architecture. Controllers handle HTTP/WebSocket, Services contain business logic, Repositories handle Prisma queries. MQTT client and WebSocket server are initialized in lib/ and used by services.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| MQTT + WebSocket dual protocols | Beacons use MQTT (IoT standard), frontend needs WebSocket for real-time | Single protocol insufficient - beacons are constrained devices requiring lightweight MQTT, frontend needs bidirectional WebSocket |
| Repository pattern abstraction | Constitution requires separation of concerns | Direct Prisma in services violates layered architecture principle |
