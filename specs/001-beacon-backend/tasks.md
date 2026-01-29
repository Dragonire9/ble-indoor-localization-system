# Tasks: BLE Beacon Backend System

**Input**: Design documents from `/specs/001-beacon-backend/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - not explicitly requested in feature specification. Focus on implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend project**: `backend/src/`, `backend/tests/` at repository root
- Paths follow plan.md structure: backend/src/controllers/, backend/src/services/, backend/src/repositories/

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure per implementation plan in backend/
- [x] T002 Initialize Node.js project with TypeScript configuration in backend/package.json
- [x] T003 [P] Install and configure Express.js, MQTT.js, Socket.io, Prisma, Zod, Winston dependencies
- [x] T004 [P] Setup TypeScript configuration with strict mode in backend/tsconfig.json
- [x] T005 [P] Configure ESLint and Prettier for code formatting in backend/
- [x] T006 [P] Create .env.example file with required environment variables in backend/
- [x] T007 [P] Setup Jest testing framework configuration in backend/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Create Prisma schema file with MongoDB configuration in backend/prisma/schema.prisma
- [x] T009 [P] Define Sector model in Prisma schema (id, name, description, timestamps) in backend/prisma/schema.prisma
- [x] T010 [P] Define Beacon model in Prisma schema (id, sectorId, geofenceId, powerState, connectionState, timestamps) in backend/prisma/schema.prisma
- [x] T011 [P] Define BeaconTelemetry model in Prisma schema (id, beaconId, timestamp, rssi, batteryLevel, etc.) in backend/prisma/schema.prisma
- [x] T012 [P] Define Geofence model in Prisma schema (id, sectorId, coordinates, name, timestamps) in backend/prisma/schema.prisma
- [x] T013 Add Prisma indexes for performance (beaconId, sectorId, connectionState, timestamp) in backend/prisma/schema.prisma
- [x] T014 Run Prisma db push to create database schema in backend/ (MongoDB uses db push, not migrate)
- [x] T015 Generate Prisma client with npx prisma generate in backend/
- [x] T104 [P] Create database seed script that reads from JSON file in backend/prisma/seed.ts and backend/prisma/seed.json
- [x] T105 [P] Add Swagger/OpenAPI documentation setup with swagger-ui-express and swagger-jsdoc in backend/src/lib/swagger.ts
- [x] T016 [P] Setup Winston logger configuration in backend/src/lib/logger.ts
- [x] T017 [P] Create global error handler middleware in backend/src/middleware/error-handler.middleware.ts
- [x] T018 [P] Create Express app setup with middleware in backend/src/app.ts
- [x] T019 [P] Create server entry point in backend/src/server.ts
- [x] T020 [P] Initialize MQTT client connection in backend/src/lib/mqtt-client.ts
- [x] T021 [P] Setup Socket.io server initialization in backend/src/lib/websocket-server.ts
- [x] T022 [P] Create TypeScript types directory structure in backend/src/types/
- [x] T023 [P] Create Zod schemas directory structure in backend/src/schemas/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Beacon Connection and Data Reception (Priority: P1) 🎯 MVP

**Goal**: Backend accepts MQTT connections from beacons, receives telemetry data, and stores it in database with proper beacon linkage

**Independent Test**: Simulate beacon publishing telemetry to MQTT topics and verify data is stored in database with correct beacon association

### Implementation for User Story 1

- [x] T024 [P] [US1] Create Beacon type definitions in backend/src/types/beacon.types.ts
- [x] T025 [P] [US1] Create BeaconTelemetry type definitions in backend/src/types/mqtt.types.ts
- [x] T026 [P] [US1] Create Zod schema for MQTT telemetry payload validation in backend/src/schemas/telemetry.schema.ts
- [x] T027 [US1] Implement BeaconRepository with create, findById, updateConnectionState methods in backend/src/repositories/beacon.repository.ts
- [x] T028 [US1] Implement BeaconTelemetryRepository with create, findByBeaconId methods in backend/src/repositories/telemetry.repository.ts
- [x] T029 [US1] Implement MqttService to subscribe to beacon topics and handle messages in backend/src/services/mqtt.service.ts
- [x] T030 [US1] Implement TelemetryService to process and store telemetry data in backend/src/services/telemetry.service.ts
- [x] T031 [US1] Add MQTT topic subscription for beacon/+/telemetry pattern in backend/src/services/mqtt.service.ts
- [x] T032 [US1] Add MQTT topic subscription for beacon/+/heartbeat pattern in backend/src/services/mqtt.service.ts
- [x] T033 [US1] Add MQTT Last Will message handling for connection state detection in backend/src/services/mqtt.service.ts
- [x] T034 [US1] Implement beacon ID extraction from MQTT topic path in backend/src/services/mqtt.service.ts
- [x] T035 [US1] Implement connection state tracking (ONLINE/OFFLINE) based on heartbeat and LWT in backend/src/services/mqtt.service.ts
- [x] T036 [US1] Add error handling for malformed MQTT messages in backend/src/services/mqtt.service.ts
- [x] T037 [US1] Add logging for MQTT message reception and processing in backend/src/services/mqtt.service.ts
- [x] T102 [US1] Implement message queue/buffer for telemetry during database connection failures in backend/src/services/telemetry.service.ts
- [x] T103 [US1] Add retry logic with exponential backoff for failed telemetry storage operations in backend/src/services/telemetry.service.ts

**Checkpoint**: At this point, User Story 1 should be fully functional - beacons can connect via MQTT, send telemetry, and data is stored in database

---

## Phase 4: User Story 2 - Beacon Management and Configuration (Priority: P2)

**Goal**: Administrators can register, configure, and manage beacon details via REST API

**Independent Test**: Create, update, and query beacon records through API endpoints

### Implementation for User Story 2

- [x] T038 [P] [US2] Create Zod schema for CreateBeaconRequest validation in backend/src/schemas/beacon.schema.ts
- [x] T039 [P] [US2] Create Zod schema for UpdateBeaconRequest validation in backend/src/schemas/beacon.schema.ts
- [x] T040 [US2] Extend BeaconRepository with findAll, update, delete methods in backend/src/repositories/beacon.repository.ts
- [x] T041 [US2] Add query methods for filtering by sectorId and connectionState in backend/src/repositories/beacon.repository.ts
- [x] T042 [US2] Implement BeaconService with business logic for beacon CRUD operations in backend/src/services/beacon.service.ts
- [x] T043 [US2] Implement BeaconController with GET /api/beacons endpoint in backend/src/controllers/beacon.controller.ts
- [x] T044 [US2] Implement BeaconController with POST /api/beacons endpoint in backend/src/controllers/beacon.controller.ts
- [x] T045 [US2] Implement BeaconController with GET /api/beacons/:beaconId endpoint in backend/src/controllers/beacon.controller.ts
- [x] T046 [US2] Implement BeaconController with PUT /api/beacons/:beaconId endpoint in backend/src/controllers/beacon.controller.ts
- [x] T047 [US2] Implement BeaconController with DELETE /api/beacons/:beaconId endpoint in backend/src/controllers/beacon.controller.ts
- [x] T048 [US2] Add input validation middleware using Zod schemas in backend/src/middleware/validation.middleware.ts
- [x] T049 [US2] Add error handling for duplicate beacon IDs in backend/src/services/beacon.service.ts
- [x] T050 [US2] Add logging for beacon CRUD operations in backend/src/services/beacon.service.ts
- [x] T051 [US2] Register beacon routes in Express app in backend/src/app.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - beacons can send data and administrators can manage beacon records

---

## Phase 5: User Story 3 - Geofence Storage and Serving (Priority: P2)

**Goal**: Administrators can store polygon-based geofences and serve them to frontend via REST API

**Independent Test**: Create geofence polygons, store them, and retrieve them via API endpoints

### Implementation for User Story 3

- [x] T052 [P] [US3] Create Zod schema for CreateGeofenceRequest with coordinate validation in backend/src/schemas/geofence.schema.ts
- [x] T053 [P] [US3] Create Zod schema for UpdateGeofenceRequest validation in backend/src/schemas/geofence.schema.ts
- [x] T054 [P] [US3] Create Geofence type definitions in backend/src/types/geofence.types.ts
- [x] T055 [US3] Implement GeofenceRepository with CRUD operations in backend/src/repositories/geofence.repository.ts
- [x] T056 [US3] Add query methods for filtering geofences by sectorId and beaconId in backend/src/repositories/geofence.repository.ts
- [x] T057 [US3] Implement GeofenceService with polygon validation logic in backend/src/services/geofence.service.ts
- [x] T058 [US3] Add validation for polygon coordinates (minimum 3 points, closed polygon) in backend/src/services/geofence.service.ts
- [x] T059 [US3] Add validation for local coordinate system (X/Y meters format) in backend/src/services/geofence.service.ts
- [x] T060 [US3] Implement GeofenceController with GET /api/geofences endpoint in backend/src/controllers/geofence.controller.ts
- [x] T061 [US3] Implement GeofenceController with POST /api/geofences endpoint in backend/src/controllers/geofence.controller.ts
- [x] T062 [US3] Implement GeofenceController with GET /api/geofences/:geofenceId endpoint in backend/src/controllers/geofence.controller.ts
- [x] T063 [US3] Implement GeofenceController with PUT /api/geofences/:geofenceId endpoint in backend/src/controllers/geofence.controller.ts
- [x] T064 [US3] Implement GeofenceController with DELETE /api/geofences/:geofenceId endpoint in backend/src/controllers/geofence.controller.ts
- [x] T065 [US3] Add error handling for invalid polygon geometry in backend/src/services/geofence.service.ts
- [x] T066 [US3] Add logging for geofence operations in backend/src/services/geofence.service.ts
- [x] T067 [US3] Register geofence routes in Express app in backend/src/app.ts
- [x] T068 [US3] Update BeaconController GET /api/beacons/:beaconId to include associated geofence in response in backend/src/controllers/beacon.controller.ts

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - geofences can be managed and served to frontend

---

## Phase 6: User Story 4 - Real-time Monitoring via WebSockets (Priority: P3)

**Goal**: Frontend monitoring clients receive real-time updates about beacon status and telemetry via WebSocket connections

**Independent Test**: Establish socket connection and verify beacon state changes and telemetry data are pushed in real-time

### Implementation for User Story 4

- [x] T069 [P] [US4] Create WebSocket event type definitions in backend/src/types/websocket.types.ts
- [x] T070 [US4] Implement WebSocketService for broadcasting updates to clients in backend/src/services/websocket.service.ts
- [x] T071 [US4] Add Socket.io connection handling and event registration in backend/src/lib/websocket-server.ts
- [x] T072 [US4] Implement beacon:state-changed event broadcasting in backend/src/services/websocket.service.ts
- [x] T073 [US4] Implement beacon:telemetry event broadcasting in backend/src/services/websocket.service.ts
- [x] T074 [US4] Implement beacon:power-state-changed event broadcasting in backend/src/services/websocket.service.ts
- [x] T075 [US4] Integrate WebSocketService with MqttService to broadcast on state changes in backend/src/services/mqtt.service.ts
- [x] T076 [US4] Integrate WebSocketService with TelemetryService to broadcast on new telemetry in backend/src/services/mqtt.service.ts
- [x] T077 [US4] Add reconnection handling for WebSocket clients in backend/src/lib/websocket-server.ts
- [x] T078 [US4] Add error handling for WebSocket connection failures in backend/src/lib/websocket-server.ts
- [x] T079 [US4] Add logging for WebSocket events and connections in backend/src/lib/websocket-server.ts
- [x] T080 [US4] Integrate Socket.io server with Express app in backend/src/app.ts

**Checkpoint**: At this point, all user stories should be independently functional - frontend can receive real-time updates via WebSockets

---

## Phase 7: Additional Features

**Purpose**: Complete remaining API endpoints and features

- [x] T081 [US2] Implement GET /api/beacons/:beaconId/telemetry endpoint for telemetry history in backend/src/controllers/beacon.controller.ts
- [x] T082 [US2] Add time range filtering for telemetry queries in backend/src/repositories/telemetry.repository.ts
- [x] T083 [US2] Add pagination support for telemetry history endpoint in backend/src/controllers/beacon.controller.ts
- [x] T084 [US3] Add Sector CRUD endpoints (GET, POST, PUT, DELETE /api/sectors) in backend/src/controllers/sector.controller.ts
- [x] T085 [US3] Implement SectorRepository with CRUD operations in backend/src/repositories/sector.repository.ts
- [x] T086 [US3] Implement SectorService with business logic in backend/src/services/sector.service.ts
- **Note**: Sector CRUD is in Phase 7 but required for US3 acceptance scenario 4 (beacon details show sector assignment). Sector endpoints can be implemented in parallel with geofence endpoints in Phase 5, or moved to Phase 5 if needed for US3 validation.
- [x] T087 [US4] Implement geofence:updated event broadcasting for geofence changes in backend/src/services/websocket.service.ts
- [x] T088 [US4] Integrate geofence events with GeofenceService in backend/src/services/geofence.service.ts

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T089 [P] Add comprehensive error messages and error codes across all services
- [x] T090 [P] Add request/response logging middleware in backend/src/middleware/request-logger.middleware.ts
- [x] T091 [P] Add CORS configuration for frontend access in backend/src/app.ts
- [x] T092 [P] Add rate limiting middleware for API endpoints in backend/src/middleware/rate-limit.middleware.ts
- [x] T093 [P] Optimize database queries to ensure no N+1 queries (use Prisma include) across all repositories
- [x] T101 [P] Add N+1 query detection tests for all repository methods using Prisma query analysis in backend/tests/integration/repository-n1-tests.ts
- [x] T094 [P] Add health check endpoint GET /api/health in backend/src/controllers/health.controller.ts
- [x] T095 [P] Add MQTT connection health monitoring in backend/src/services/mqtt.service.ts
- [x] T096 [P] Add WebSocket connection count monitoring in backend/src/services/websocket.service.ts
- [x] T097 [P] Review and optimize Prisma queries for performance (select only needed fields)
- [x] T098 [P] Add data validation for edge cases (duplicate IDs, invalid coordinates, etc.)
- [x] T099 [P] Update documentation with API usage examples
- [x] T100 [P] Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Additional Features (Phase 7)**: Depends on core user stories completion
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Uses Beacon entity from US1 but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Uses Sector entity but independently testable
- **User Story 4 (P3)**: Depends on US1 completion (needs MQTT service and telemetry service) - Integrates with US1/US2 but independently testable

### Within Each User Story

- Type definitions and schemas before repositories
- Repositories before services
- Services before controllers
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T007)
- All Foundational tasks marked [P] can run in parallel (T009-T012, T016-T023)
- Once Foundational phase completes, User Stories 2 and 3 can start in parallel (US1 must complete first for US4)
- Type definitions and schemas within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members (after US1)

---

## Parallel Example: User Story 1

```bash
# Launch all type definitions and schemas for User Story 1 together:
Task: "Create Beacon type definitions in backend/src/types/beacon.types.ts"
Task: "Create BeaconTelemetry type definitions in backend/src/types/mqtt.types.ts"
Task: "Create Zod schema for MQTT telemetry payload validation in backend/src/schemas/telemetry.schema.ts"

# Launch repositories together (after types):
Task: "Implement BeaconRepository with create, findById, updateConnectionState methods"
Task: "Implement BeaconTelemetryRepository with create, findByBeaconId methods"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Simulate beacon publishing to MQTT
   - Verify telemetry stored in database
   - Verify connection state tracking works
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (P1) - CRITICAL PATH
   - Once US1 complete:
     - Developer A: User Story 4 (P3) - depends on US1
     - Developer B: User Story 2 (P2) - can work in parallel
     - Developer C: User Story 3 (P2) - can work in parallel
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Ensure no N+1 queries - use Prisma `include` for related data
- All input validation using Zod schemas before service layer
- Structured logging with Winston for all operations
- Error handling with custom error objects and global error handler
