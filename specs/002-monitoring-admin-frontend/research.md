# Research: Frontend Implementation

**Date**: 2026-01-21
**Feature**: Monitoring and Administrative Management Frontend

## Better Auth Integration

### Decision: Use Better Auth for Session-Based Authentication

**Rationale**:
- Better Auth provides comprehensive authentication solution with built-in session management
- Supports Prisma adapter with MongoDB (matches existing backend database)
- Integrates seamlessly with Express.js (backend) and Next.js (frontend)
- TypeScript-first with excellent type safety
- Built-in email/password authentication matches specification requirements
- Session management handled automatically (no manual cookie management)

**Alternatives Considered**:
- **NextAuth.js**: More complex setup, less type-safe, requires more configuration
- **Custom JWT implementation**: Too much boilerplate, security risks, maintenance burden
- **Clerk/Supabase Auth**: External dependency, vendor lock-in, overkill for admin-only system

**Implementation Details**:

1. **Backend Integration (Express.js)**:
   - Install `better-auth` package
   - Create `backend/src/lib/auth.ts` with Better Auth instance
   - Use Prisma adapter with existing PrismaClient
   - Mount handler at `/api/auth/*` using `toNodeHandler` from `better-auth/node`
   - Configure email/password authentication
   - Generate schema using `npx @better-auth/cli generate`

2. **Frontend Integration (Next.js)**:
   - Install `better-auth` package
   - Create `apps/frontend/app/api/auth/[...all]/route.ts` using `toNextJsHandler`
   - Create `apps/frontend/lib/auth-client.ts` using `createAuthClient` from `better-auth/react`
   - Use `useSession` hook for session management
   - Protect routes using middleware or server components

3. **Database Schema**:
   - Better Auth CLI will generate Prisma schema additions
   - Required tables: `user`, `session`, `account`, `verification`
   - Schema generation: `npx @better-auth/cli generate`
   - Apply to database: `prisma db push` (MongoDB)

**References**:
- [Better Auth Express Integration](https://www.better-auth.com/docs/integrations/express)
- [Better Auth Next.js Integration](https://www.better-auth.com/docs/integrations/next)
- [Better Auth Prisma Adapter](https://www.better-auth.com/docs/adapters/prisma)
- [Better Auth Basic Usage](https://www.better-auth.com/docs/basic-usage)

## UI Component Library

### Decision: Use shadcn/ui with Sonner and Empty State Components

**Rationale**:
- shadcn/ui provides accessible, customizable components built on Radix UI
- Sonner toast library provides excellent UX for notifications/alerts
- Empty state component available for handling empty data states
- Tailwind CSS integration matches constitution requirements
- Copy-paste component model allows customization

**Implementation**:
- Install shadcn/ui: `npx shadcn@latest init`
- Add Sonner: `npx shadcn@latest add sonner`
- Add Empty state component: `npx shadcn@latest add empty-state` (or create custom using shadcn patterns)
- Configure Tailwind CSS with shadcn theme

## Real-Time Updates

### Decision: Use Socket.io Client for WebSocket Communication

**Rationale**:
- Backend already uses Socket.io server
- Socket.io provides automatic reconnection, fallback to polling
- Type-safe event handling with TypeScript
- Matches existing backend implementation

**Implementation**:
- Install `socket.io-client` (latest version)
- Create `apps/frontend/lib/websocket.ts` for Socket.io client setup
- Use React hooks to manage connection state
- Implement automatic reconnection logic
- Handle connection failures gracefully with fallback to API polling

## State Management

### Decision: React Query for Server State, Zustand for Client State

**Rationale**:
- Matches constitution requirements (Principle VIII, IX)
- React Query provides excellent caching, refetching, and synchronization
- Zustand is lightweight for client state (filters, UI state)
- Clear separation prevents state management confusion

**Implementation**:
- Install `@tanstack/react-query` (latest version)
- Install `zustand` (latest version)
- Create query key factories in `packages/api-beacon/src/query-keys.ts`
- Define endpoint constants in `packages/api-beacon/src/endpoints.ts`
- Create Zustand stores for client state (filters, sidebar state, etc.)

## Indoor Map Visualization

### Decision: Custom Canvas/SVG-Based Visualization

**Rationale**:
- Specification requires local X/Y coordinate system (not geographic map)
- No need for external mapping services (Google Maps, OpenStreetMap)
- Custom implementation provides full control over coordinate system
- Lightweight, no external dependencies

**Implementation**:
- Use HTML5 Canvas or SVG for rendering
- Implement coordinate transformation (world coordinates to screen coordinates)
- Support zoom and pan functionality
- Render geofence polygons from coordinate arrays
- Display beacon icons at geofence centers
- Consider libraries: `react-konva` (Canvas) or `@react-svg/core` (SVG)

## Form Validation

### Decision: React Hook Form with Zod Resolver

**Rationale**:
- Matches constitution requirements (Principle XI)
- Type-safe validation with Zod
- Excellent performance with uncontrolled components
- Integrates well with shadcn/ui form components

**Implementation**:
- Install `react-hook-form` and `@hookform/resolvers`
- Define Zod schemas in `apps/frontend/types/` folder
- Use `useForm` hook with `zodResolver`
- Integrate with shadcn/ui form components

## Package Version Strategy

### Decision: Use Latest Compatible Versions

**Rationale**:
- User requirement: "frontend MUST use latest package versions"
- Constitution Principle XI requires latest compatible versions
- Ensures security, performance, and feature availability

**Implementation**:
- Check latest versions for all packages before installation
- Use `npm install package@latest` or check npm registry
- Document versions in package.json
- Test compatibility before committing
