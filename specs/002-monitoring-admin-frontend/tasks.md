# Tasks: Monitoring and Administrative Management Frontend

**Input**: Design documents from `/specs/002-monitoring-admin-frontend/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - not explicitly requested in feature specification. Focus on implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US0, US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo project**: `apps/frontend/`, `apps/backend/`, `packages/` at repository root
- Paths follow plan.md structure: apps/frontend/app/, apps/frontend/components/, apps/frontend/lib/

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and monorepo structure

- [X] T001 Create Turborepo monorepo structure with root package.json and turbo.json at repository root
- [X] T002 [P] Initialize Next.js 15+ application with TypeScript and App Router in apps/frontend/
- [X] T003 [P] Install and configure Tailwind CSS in apps/frontend/
- [X] T004 [P] Install shadcn/ui and initialize configuration in apps/frontend/
- [X] T005 [P] Install core dependencies (React Query, Zustand, React Hook Form, Axios, Zod, Socket.io-client, Better Auth) in apps/frontend/package.json
- [X] T006 [P] Install Better Auth in apps/backend/package.json
- [X] T007 [P] Create .env.example files for frontend and backend with required environment variables
- [X] T008 [P] Configure TypeScript with strict mode in apps/frontend/tsconfig.json
- [X] T009 [P] Setup ESLint and Prettier configuration in apps/frontend/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Better Auth Backend Integration

- [X] T010 Create Better Auth instance with Prisma adapter in apps/backend/src/lib/auth.ts
- [ ] T011 Generate Better Auth Prisma schema using npx @better-auth/cli generate in apps/backend/ (NOTE: Run manually: npx @better-auth/cli generate)
- [ ] T012 Run Prisma db push to apply Better Auth schema to MongoDB in apps/backend/ (NOTE: Run manually: npx prisma db push)
- [X] T013 Mount Better Auth handler at /api/auth/* using toNodeHandler in apps/backend/src/app.ts
- [X] T014 Configure Better Auth email/password authentication in apps/backend/src/lib/auth.ts
- [X] T015 Add BETTER_AUTH_SECRET and BETTER_AUTH_URL to backend environment variables

### Frontend API Infrastructure

- [X] T016 Create Axios client instance with baseURL and credentials in apps/frontend/lib/api/client.ts
- [X] T017 Create endpoint constants file for all API endpoints in apps/frontend/lib/api/endpoints.ts
- [X] T018 Create query key factory functions following hierarchical pattern in apps/frontend/lib/api/query-keys.ts
- [X] T019 Create React Query provider component in apps/frontend/providers/query-provider.tsx
- [X] T020 Integrate QueryProvider in apps/frontend/app/layout.tsx root layout

### Type Definitions

- [X] T021 [P] Create Zod schemas for Beacon entity in apps/frontend/types/beacon.ts
- [X] T022 [P] Create Zod schemas for BeaconTelemetry entity in apps/frontend/types/telemetry.ts
- [X] T023 [P] Create Zod schemas for Geofence entity in apps/frontend/types/geofence.ts
- [X] T024 [P] Create Zod schemas for Sector entity in apps/frontend/types/sector.ts
- [X] T025 [P] Create Zod schemas for form inputs (CreateBeaconInput, UpdateBeaconInput, etc.) in apps/frontend/types/forms.ts

### Better Auth Frontend Setup

- [X] T026 Create Better Auth client instance in apps/frontend/lib/auth-client.ts
- [X] T027 Create Better Auth server instance in apps/frontend/lib/auth.ts
- [X] T028 Create Better Auth API route handler in apps/frontend/app/api/auth/[...all]/route.ts
- [X] T029 Add NEXT_PUBLIC_API_URL, BETTER_AUTH_URL, and BETTER_AUTH_SECRET to frontend environment variables

### WebSocket Client

- [X] T030 Create Socket.io client utility with connection management in apps/frontend/lib/websocket.ts

### Shared UI Components

- [X] T031 [P] Install Sonner toast component using shadcn/ui in apps/frontend/
- [X] T032 [P] Create Empty state component using shadcn/ui patterns in apps/frontend/components/ui/empty-state.tsx
- [X] T033 [P] Install required shadcn/ui components (button, input, form, card, table, dialog, select) in apps/frontend/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 0 - Administrator Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable administrators to authenticate using email/password before accessing any monitoring or management features

**Independent Test**: Can be fully tested by attempting to access protected pages without authentication (should redirect to login), logging in with valid credentials (should grant access), and logging out (should revoke access)

### Implementation for User Story 0

- [X] T034 [US0] Create login page with email/password form in apps/frontend/app/(auth)/login/page.tsx
- [X] T035 [US0] Implement login form validation using React Hook Form with Zod resolver in apps/frontend/app/(auth)/login/page.tsx
- [X] T036 [US0] Integrate Better Auth signIn.email in login page with error handling and toast notifications in apps/frontend/app/(auth)/login/page.tsx
- [X] T037 [US0] Create authentication middleware to check session and redirect unauthenticated users in apps/frontend/middleware.ts
- [X] T038 [US0] Create protected route layout that requires authentication in apps/frontend/app/(dashboard)/layout.tsx
- [X] T039 [US0] Create logout functionality with signOut and redirect to login in apps/frontend/components/layout/header.tsx
- [X] T040 [US0] Create session check hook using authClient.useSession in apps/frontend/hooks/use-session.ts
- [X] T041 [US0] Handle session expiration with automatic redirect to login in apps/frontend/middleware.ts

**Checkpoint**: At this point, User Story 0 should be fully functional - users can log in, access is protected, and logout works

---

## Phase 4: User Story 1 - Real-time Beacon Monitoring Dashboard (Priority: P1) 🎯 MVP

**Goal**: Display real-time monitoring dashboard showing all beacons with connection state, power state, battery levels, and recent telemetry data with automatic updates

**Independent Test**: Can be fully tested by opening the monitoring dashboard and verifying that beacon status updates appear automatically when beacons connect/disconnect or send new telemetry data

### Implementation for User Story 1

- [X] T042 [US1] Create React Query hook to fetch all beacons with filtering in apps/frontend/hooks/use-beacons.ts
- [X] T043 [US1] Create dashboard page component in apps/frontend/app/(dashboard)/dashboard/page.tsx
- [X] T044 [US1] Create beacon list component with connection state, power state, and last seen display in apps/frontend/components/beacons/beacon-list.tsx
- [X] T045 [US1] Create beacon card component for individual beacon display in apps/frontend/components/beacons/beacon-card.tsx
- [X] T046 [US1] Implement filtering by sector ID using select dropdown in apps/frontend/components/beacons/beacon-filters.tsx
- [X] T047 [US1] Implement filtering by connection state (ONLINE/OFFLINE) in apps/frontend/components/beacons/beacon-filters.tsx
- [X] T048 [US1] Create Zustand store for dashboard filters and view state in apps/frontend/stores/dashboard-store.ts
- [X] T049 [US1] Integrate WebSocket client to listen for beacon update events in apps/frontend/hooks/use-beacon-websocket.ts
- [X] T050 [US1] Update React Query cache when WebSocket events received (beacon:update, beacon:create, beacon:delete) in apps/frontend/hooks/use-beacon-websocket.ts
- [X] T051 [US1] Display battery level and RSSI from latest telemetry in beacon card component in apps/frontend/components/beacons/beacon-card.tsx
- [X] T052 [US1] Implement visual indicators for low battery and offline beacons with alerts in apps/frontend/components/beacons/beacon-card.tsx
- [X] T053 [US1] Add empty state component when no beacons exist in apps/frontend/components/beacons/beacon-list.tsx
- [X] T054 [US1] Implement pagination or virtualization for large beacon lists (100+ beacons) in apps/frontend/components/beacons/beacon-list.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - dashboard displays beacons with real-time updates via WebSocket

---

## Phase 5: User Story 5 - Real-time Updates via WebSocket (Priority: P1)

**Goal**: Establish WebSocket connections for real-time updates about beacon status changes, telemetry data, and geofence updates

**Independent Test**: Can be fully tested by establishing a WebSocket connection and verifying that beacon state changes, telemetry updates, and geofence changes are pushed to the frontend immediately

### Implementation for User Story 5

- [ ] T055 [US5] Create WebSocket hook for beacon events with automatic reconnection in apps/frontend/hooks/use-beacon-websocket.ts
- [ ] T056 [US5] Create WebSocket hook for telemetry events in apps/frontend/hooks/use-telemetry-websocket.ts
- [ ] T057 [US5] Create WebSocket hook for geofence events in apps/frontend/hooks/use-geofence-websocket.ts
- [ ] T058 [US5] Implement automatic reconnection logic with exponential backoff in apps/frontend/lib/websocket.ts
- [ ] T059 [US5] Implement fallback to API polling when WebSocket unavailable in apps/frontend/hooks/use-beacon-websocket.ts (poll every 5 seconds when WebSocket connection fails, automatically switch back to WebSocket when connection restored)
- [ ] T060 [US5] Handle connection state changes (online/offline) with UI indicators in apps/frontend/components/layout/connection-status.tsx
- [ ] T061 [US5] Ensure multiple browser tabs receive same real-time updates simultaneously (Socket.io handles this)

**Checkpoint**: At this point, User Story 5 should be fully functional - WebSocket connections work with automatic reconnection

---

## Phase 6: User Story 2 - Beacon Administrative Management (Priority: P2)

**Goal**: Enable administrators to register new beacons, update configurations, view details and telemetry history, and remove beacons

**Independent Test**: Can be fully tested by creating a new beacon record, updating its configuration, viewing its details and telemetry history, and deleting it

### Implementation for User Story 2

- [X] T062 [US2] Create beacons list page with table view in apps/frontend/app/(dashboard)/beacons/page.tsx
- [X] T063 [US2] Create React Query hook for creating beacon with mutation in apps/frontend/hooks/use-create-beacon.ts
- [X] T064 [US2] Create React Query hook for updating beacon with mutation in apps/frontend/hooks/use-update-beacon.ts
- [X] T065 [US2] Create React Query hook for deleting beacon with mutation in apps/frontend/hooks/use-delete-beacon.ts
- [X] T066 [US2] Create React Query hook for fetching beacon by ID in apps/frontend/hooks/use-beacon.ts
- [X] T067 [US2] Create React Query hook for fetching beacon telemetry with time range filtering in apps/frontend/hooks/use-beacon-telemetry.ts
- [X] T068 [US2] Create create beacon form component with validation in apps/frontend/components/beacons/create-beacon-form.tsx
- [X] T069 [US2] Create update beacon form component with validation in apps/frontend/components/beacons/update-beacon-form.tsx
- [X] T070 [US2] Create beacon details page showing comprehensive information in apps/frontend/app/(dashboard)/beacons/[beaconId]/page.tsx
- [X] T071 [US2] Create telemetry history view with time range filter in apps/frontend/app/(dashboard)/beacons/[beaconId]/telemetry/page.tsx
- [X] T072 [US2] Implement pagination for telemetry history (up to 1000 records) in apps/frontend/components/beacons/telemetry-table.tsx
- [X] T073 [US2] Create delete beacon confirmation dialog in apps/frontend/components/beacons/delete-beacon-dialog.tsx
- [X] T074 [US2] Integrate WebSocket updates for beacon CRUD operations in beacons list page in apps/frontend/app/(dashboard)/beacons/page.tsx
- [X] T075 [US2] Add empty state component when no beacons exist in apps/frontend/components/beacons/beacon-list.tsx

**Checkpoint**: At this point, User Story 2 should be fully functional - complete beacon lifecycle management

---

## Phase 7: User Story 3 - Geofence Visualization and Management (Priority: P2)

**Goal**: Enable administrators to view geofence polygons on indoor map, create geofences by drawing polygons, edit existing geofences, and associate with beacons

**Independent Test**: Can be fully tested by creating a geofence polygon on the indoor map, viewing it with associated beacons, editing its coordinates, and deleting it

### Implementation for User Story 3

- [ ] T076 [US3] Create indoor map visualization component using Canvas or SVG in apps/frontend/components/map/indoor-map.tsx
- [ ] T077 [US3] Implement coordinate transformation (world to screen coordinates) in apps/frontend/components/map/coordinate-utils.ts
- [ ] T078 [US3] Implement zoom and pan functionality for indoor map in apps/frontend/components/map/indoor-map.tsx
- [ ] T079 [US3] Create geofence polygon renderer component in apps/frontend/components/map/geofence-polygon.tsx
- [X] T080 [US3] Create React Query hook for fetching all geofences in apps/frontend/hooks/use-geofences.ts
- [X] T081 [US3] Create React Query hook for creating geofence with mutation in apps/frontend/hooks/use-create-geofence.ts
- [X] T082 [US3] Create React Query hook for updating geofence with mutation in apps/frontend/hooks/use-update-geofence.ts
- [X] T083 [US3] Create React Query hook for deleting geofence with mutation in apps/frontend/hooks/use-delete-geofence.ts
- [X] T084 [US3] Create geofences page with map visualization in apps/frontend/app/(dashboard)/geofences/page.tsx
- [ ] T085 [US3] Implement polygon drawing tool for creating geofences by clicking points in apps/frontend/components/map/polygon-drawer.tsx
- [ ] T086 [US3] Implement polygon editing tool for modifying existing geofence coordinates in apps/frontend/components/map/polygon-editor.tsx
- [ ] T087 [US3] Display beacon icons at center of associated geofence polygons in apps/frontend/components/map/beacon-marker.tsx
- [ ] T088 [US3] Create geofence details panel showing associated beacons and sector in apps/frontend/components/geofences/geofence-details.tsx
- [ ] T089 [US3] Implement geofence selection with highlight and details display in apps/frontend/components/map/indoor-map.tsx
- [ ] T090 [US3] Implement filtering geofences by sector ID in apps/frontend/components/geofences/geofence-filters.tsx
- [ ] T091 [US3] Implement filtering geofences by associated beacon ID in apps/frontend/components/geofences/geofence-filters.tsx
- [X] T092 [US3] Integrate WebSocket updates for geofence CRUD operations in geofences page in apps/frontend/app/(dashboard)/geofences/page.tsx
- [X] T093 [US3] Add empty state component when no geofences exist in apps/frontend/components/geofences/geofence-list.tsx
- [ ] T094 [US3] Validate polygon has minimum 3 coordinate points before creation in apps/frontend/components/map/polygon-drawer.tsx

**Checkpoint**: At this point, User Story 3 should be fully functional - geofence visualization and management complete

---

## Phase 8: User Story 4 - Sector Management (Priority: P3)

**Goal**: Enable administrators to create, view, update, and delete sectors and view all associated beacons and geofences

**Independent Test**: Can be fully tested by creating a sector, viewing its associated beacons and geofences, updating sector details, and deleting it

### Implementation for User Story 4

- [X] T095 [US4] Create React Query hook for fetching all sectors in apps/frontend/hooks/use-sectors.ts
- [X] T096 [US4] Create React Query hook for fetching sector by ID in apps/frontend/hooks/use-sector.ts
- [X] T097 [US4] Create React Query hook for creating sector with mutation in apps/frontend/hooks/use-create-sector.ts
- [X] T098 [US4] Create React Query hook for updating sector with mutation in apps/frontend/hooks/use-update-sector.ts
- [X] T099 [US4] Create React Query hook for deleting sector with mutation in apps/frontend/hooks/use-delete-sector.ts
- [X] T100 [US4] Create sectors list page with summary information in apps/frontend/app/(dashboard)/sectors/page.tsx
- [X] T101 [US4] Create sector details page showing associated beacons and geofences in apps/frontend/app/(dashboard)/sectors/[sectorId]/page.tsx
- [X] T102 [US4] Create create sector form component with validation in apps/frontend/components/sectors/create-sector-form.tsx
- [X] T103 [US4] Create update sector form component with validation in apps/frontend/components/sectors/update-sector-form.tsx
- [X] T104 [US4] Create delete sector confirmation dialog with validation (prevent if beacons/geofences associated) in apps/frontend/components/sectors/delete-sector-dialog.tsx
- [X] T105 [US4] Display beacon count and geofence count in sector list item in apps/frontend/components/sectors/sector-card.tsx
- [X] T106 [US4] Add empty state component when no sectors exist in apps/frontend/components/sectors/sector-list.tsx

**Checkpoint**: At this point, User Story 4 should be fully functional - complete sector management

---

## Phase 9: Layout and Navigation

**Purpose**: Create shared layout components and navigation structure

- [X] T107 Create sidebar navigation component with Dashboard, Beacons, Geofences, Sectors links in apps/frontend/components/layout/sidebar.tsx
- [X] T108 Create header component with user info and logout button in apps/frontend/components/layout/header.tsx
- [X] T109 Create main layout wrapper with sidebar and header in apps/frontend/app/(dashboard)/layout.tsx
- [X] T110 Implement active route highlighting in sidebar navigation in apps/frontend/components/layout/sidebar.tsx
- [X] T111 Add Toaster component from Sonner for toast notifications in apps/frontend/app/layout.tsx

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T112 [P] Add loading states (skeletons) for all data fetching operations across all pages
- [X] T113 [P] Add error boundaries for graceful error handling in apps/frontend/components/error-boundary.tsx
- [X] T114 [P] Implement timezone handling for all timestamp displays using date-fns or similar in apps/frontend/lib/date-utils.ts
- [X] T115 [P] Add user preferences persistence (filters, view settings) using localStorage in apps/frontend/stores/preferences-store.ts
- [X] T116 [P] Optimize performance for rendering 100+ beacons (virtualization, memoization) in apps/frontend/components/beacons/beacon-list.tsx
- [X] T117 [P] Add accessibility improvements (ARIA labels, keyboard navigation) across all components
- [X] T118 [P] Add responsive design improvements for mobile/tablet views
- [X] T119 [P] Code cleanup and refactoring - remove unused code, optimize imports
- [X] T120 [P] Update documentation in README.md with frontend setup instructions
- [X] T121 [P] Validate quickstart.md instructions work correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 0 (Authentication) must complete before other stories
  - User Stories 1 and 5 can proceed in parallel after US0
  - User Stories 2, 3, 4 can proceed in parallel after US0, US1, US5
- **Layout (Phase 9)**: Can proceed in parallel with user stories but needed for complete UI
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 0 (P1)**: Can start after Foundational (Phase 2) - BLOCKS all other stories
- **User Story 1 (P1)**: Depends on US0 completion - Can proceed in parallel with US5
- **User Story 5 (P1)**: Depends on US0 completion - Can proceed in parallel with US1
- **User Story 2 (P2)**: Depends on US0, US1, US5 completion - Can proceed in parallel with US3, US4
- **User Story 3 (P2)**: Depends on US0, US1, US5 completion - Can proceed in parallel with US2, US4
- **User Story 4 (P3)**: Depends on US0, US1, US5 completion - Can proceed in parallel with US2, US3

### Within Each User Story

- Hooks before components
- Components before pages
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- After US0 completes, US1 and US5 can run in parallel
- After US1 and US5 complete, US2, US3, and US4 can run in parallel
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all type definitions in parallel:
Task: "Create Zod schemas for Beacon entity in apps/frontend/types/beacon.ts"
Task: "Create Zod schemas for BeaconTelemetry entity in apps/frontend/types/telemetry.ts"
Task: "Create Zod schemas for Geofence entity in apps/frontend/types/geofence.ts"
Task: "Create Zod schemas for Sector entity in apps/frontend/types/sector.ts"

# Launch all hooks in parallel (after types):
Task: "Create React Query hook to fetch all beacons with filtering in apps/frontend/hooks/use-beacons.ts"
Task: "Create React Query hook for creating beacon with mutation in apps/frontend/hooks/use-create-beacon.ts"
Task: "Create React Query hook for updating beacon with mutation in apps/frontend/hooks/use-update-beacon.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 0, 1, 5 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 0 (Authentication)
4. Complete Phase 4: User Story 1 (Dashboard)
5. Complete Phase 5: User Story 5 (WebSocket)
6. **STOP and VALIDATE**: Test all three stories independently
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 0 → Test independently → Deploy/Demo (Authentication working!)
3. Add User Story 1 → Test independently → Deploy/Demo (Dashboard working!)
4. Add User Story 5 → Test independently → Deploy/Demo (Real-time updates working!)
5. Add User Story 2 → Test independently → Deploy/Demo (Beacon management!)
6. Add User Story 3 → Test independently → Deploy/Demo (Geofence visualization!)
7. Add User Story 4 → Test independently → Deploy/Demo (Sector management!)
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 0 (Authentication) - BLOCKS others
3. Once US0 is done:
   - Developer A: User Story 1 (Dashboard)
   - Developer B: User Story 5 (WebSocket)
4. Once US1 and US5 are done:
   - Developer A: User Story 2 (Beacon Management)
   - Developer B: User Story 3 (Geofence Management)
   - Developer C: User Story 4 (Sector Management)
5. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All tasks include exact file paths for clarity
- Better Auth backend integration must complete before frontend authentication
- WebSocket integration supports all real-time features across stories

---

## Summary

- **Total Tasks**: 121
- **Setup Tasks**: 9 (Phase 1)
- **Foundational Tasks**: 23 (Phase 2)
- **User Story 0 Tasks**: 8 (Phase 3)
- **User Story 1 Tasks**: 13 (Phase 4)
- **User Story 5 Tasks**: 7 (Phase 5)
- **User Story 2 Tasks**: 14 (Phase 6)
- **User Story 3 Tasks**: 19 (Phase 7)
- **User Story 4 Tasks**: 12 (Phase 8)
- **Layout Tasks**: 5 (Phase 9)
- **Polish Tasks**: 10 (Phase 10)

**Suggested MVP Scope**: User Stories 0, 1, and 5 (Authentication + Dashboard + Real-time Updates)

**Parallel Opportunities**:
- All Setup tasks can run in parallel
- All Foundational tasks marked [P] can run in parallel
- US1 and US5 can run in parallel after US0
- US2, US3, US4 can run in parallel after US0, US1, US5
- All Polish tasks can run in parallel
