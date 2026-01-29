# Implementation Plan: Monitoring and Administrative Management Frontend

**Branch**: `002-monitoring-admin-frontend` | **Date**: 2026-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-monitoring-admin-frontend/spec.md`

## Summary

Build a Next.js frontend application for real-time monitoring and administrative management of BLE beacon infrastructure. The frontend will provide:
- Real-time beacon monitoring dashboard with WebSocket updates
- Administrative interfaces for beacon, geofence, and sector management
- Indoor map visualization for geofence polygons (local X/Y coordinate system)
- Session-based authentication using Better Auth
- Monorepo architecture using Turborepo

**Technical Approach**: Next.js 15+ (App Router), React Query for server state, Zustand for client state, shadcn/ui components, Socket.io client for real-time updates, Better Auth for authentication. All packages must use latest compatible versions.

## Technical Context

**Language/Version**: TypeScript 5.9+, Node.js 18+
**Primary Dependencies**:
- Frontend: Next.js 15+, React 19+, React Query (TanStack Query), Zustand, React Hook Form, Axios, Zod, shadcn/ui, Tailwind CSS, Socket.io-client, Better Auth
- Backend: Express.js 5.2+, Better Auth (to be added), Prisma 6.19+, MongoDB
**Storage**: MongoDB (via Prisma) - existing backend database
**Testing**: Jest, React Testing Library (to be configured)
**Target Platform**: Modern web browsers (desktop/laptop primary, responsive design)
**Project Type**: Monorepo (Turborepo) with `apps/backend` and `apps/frontend`
**Performance Goals**:
- Real-time updates within 500ms of backend state changes
- Dashboard renders 100+ beacons in <1 second
- WebSocket connection uptime 99%
**Constraints**:
- Must use latest package versions
- Must follow constitution frontend architecture principles
- Must use shadcn/ui components (Sonner for toasts, Empty state component)
- Must use Better Auth for authentication
**Scale/Scope**:
- 1-10 concurrent administrators
- 100+ beacons displayed simultaneously
- 1000+ telemetry records with pagination

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Frontend Architecture (VIII, IX, X, XI) - ✅ PASS
- **API Layer**: Will use React Query (TanStack Query) for all server state management
- **State Management**: Server state via React Query, client state via Zustand (no mixing)
- **Component Structure**: Server Components by default, Client Components only when necessary
- **Type Safety**: All API types defined using Zod schemas with type inference
- **Endpoint Constants**: All endpoints in `endpoints.ts` files (no hardcoded URLs)
- **Query Keys**: Hierarchical pattern using factory functions
- **Explicit Return Types**: All exported hooks have explicit return types
- **Component Library**: shadcn/ui components (Sonner for toasts, Empty state)
- **Styling**: Tailwind CSS with semantic utility classes
- **Form Validation**: React Hook Form with Zod resolver
- **Package Versions**: Latest compatible versions

### Monorepo Architecture - ✅ PASS
- **Structure**: Turborepo with `apps/backend`, `apps/frontend`, `packages/`
- **Naming**: Shared packages use `@repo/` prefix
- **Peer Dependencies**: Large libraries listed as both dependencies and peerDependencies
- **Type Portability**: Exported hooks have explicit return types

### Backend Integration - ✅ PASS
- **Authentication**: Better Auth will be integrated into backend Express app
- **API Endpoints**: Existing REST API endpoints will be used, new endpoints created if needed
- **WebSocket**: Existing Socket.io server will be used for real-time updates

### Security & Authentication (IV) - ✅ PASS
- **Better Auth**: Session-based authentication with email/password
- **Route Protection**: All routes except login protected
- **Session Management**: Better Auth handles session management

## Project Structure

### Documentation (this feature)

```text
specs/002-monitoring-admin-frontend/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Monorepo structure (Turborepo)
apps/
├── backend/              # Existing Express.js backend
│   ├── src/
│   │   ├── lib/
│   │   │   └── auth.ts    # Better Auth instance (to be added)
│   │   └── ...
│   └── package.json
│
└── frontend/              # New Next.js frontend
    ├── app/               # Next.js App Router
    │   ├── (auth)/        # Auth route group
    │   │   └── login/
    │   ├── (dashboard)/   # Protected route group
    │   │   ├── dashboard/
    │   │   ├── beacons/
    │   │   ├── geofences/
    │   │   └── sectors/
    │   ├── api/
    │   │   └── auth/
    │   │       └── [...all]/
    │   │           └── route.ts  # Better Auth handler
    │   └── layout.tsx
    ├── components/        # React components
    │   ├── ui/            # shadcn/ui components
    │   ├── layout/        # Layout components (sidebar, header)
    │   ├── beacons/       # Beacon-related components
    │   ├── geofences/     # Geofence-related components
    │   ├── sectors/       # Sector-related components
    │   └── map/           # Indoor map visualization
    ├── lib/               # Utilities
    │   ├── auth.ts        # Better Auth client instance
    │   ├── api/           # API client setup
    │   │   ├── client.ts  # Axios instance
    │   │   ├── endpoints.ts
    │   │   └── query-keys.ts
    │   └── websocket.ts   # Socket.io client
    ├── hooks/             # Custom React hooks
    ├── stores/           # Zustand stores
    ├── types/             # TypeScript types and Zod schemas
    └── package.json

packages/                  # Shared packages
├── api-beacon/            # Beacon API types and hooks
│   ├── src/
│   │   ├── endpoints.ts
│   │   ├── query-keys.ts
│   │   ├── types.ts
│   │   └── hooks.ts
│   └── package.json
└── ui/                    # Shared UI components (if needed)
    └── package.json

# Root
turbo.json                 # Turborepo configuration
package.json               # Root package.json
```

**Structure Decision**: Monorepo architecture using Turborepo. Frontend is a Next.js 15+ application using App Router. Shared packages for API types and hooks to ensure type portability. Better Auth integrated in both backend (Express handler) and frontend (Next.js API route + client).

## Complexity Tracking

> **No violations detected - all architecture decisions align with constitution**
