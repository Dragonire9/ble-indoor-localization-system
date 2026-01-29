<!--
Sync Impact Report:
Version change: 1.0.0 → 2.0.0 (Frontend development and monorepo architecture added)
Modified principles: None
Added sections:
  - Frontend Architecture Principles (VIII, IX, X, XI)
  - Monorepo Architecture section
  - Frontend Technology Stack
  - Frontend Development Workflow
Removed sections: None
Templates requiring updates:
  ✅ plan-template.md - Constitution Check section exists and will reference these principles
  ✅ spec-template.md - No direct constitution references, compatible
  ✅ tasks-template.md - No direct constitution references, compatible
  ✅ checklist-template.md - No direct constitution references, compatible
Follow-up TODOs: None
-->

# BLE Indoor Localization System Constitution

## Core Principles

### I. Layered Architecture (NON-NEGOTIABLE)
The backend MUST enforce strict separation of concerns across three distinct layers:
- **Controllers**: Handle HTTP requests/responses only. NO business logic allowed.
- **Services**: Contain ALL business logic. Controllers delegate to services.
- **Repositories/DAL**: Handle direct database interactions via Prisma. Services use repositories for data access.

**Rationale**: This separation ensures maintainability, testability, and clear responsibility boundaries. Business logic in controllers creates tight coupling and makes testing difficult.

### II. SOLID Principles
All code MUST adhere strictly to SOLID principles, with special emphasis on:
- **Single Responsibility Principle (SRP)**: Each class/function has one reason to change.
- **Dependency Injection (DI)**: Dependencies are injected, not instantiated directly. This enables testing and loose coupling.

**Rationale**: SOLID principles ensure code remains maintainable as the system scales. DI allows for easy mocking in tests and flexible component replacement.

### III. Database Performance (NON-NEGOTIABLE)
N+1 queries are STRICTLY FORBIDDEN. Database queries inside loops (map, forEach, for) are prohibited.

**Required Pattern**: Use Prisma's `include` for eager loading or `in` operator for batch fetching to retrieve related data in a single query.

**Rationale**: N+1 queries cause exponential performance degradation as data scales. A single query fetching 100 users with posts should use one database round-trip, not 101.

### IV. Security & Authentication
- **JWT Strategy**: Access tokens MUST have short expiry (15 minutes). Refresh tokens with longer expiry (7 days) MUST be stored securely in the database.
- **Password Handling**: Plain-text passwords are NEVER stored. Use `bcrypt` or `argon2` for hashing.
- **Route Protection**: All protected routes MUST pass through an `authenticate` middleware that attaches decoded user payload to `req.user`.

**Rationale**: Security is foundational. Short-lived access tokens limit exposure from token theft. Password hashing prevents data breaches from exposing user credentials.

### V. Error Handling & Logging
- **Global Error Handler**: A centralized error handler middleware MUST catch and format all errors.
- **Structured Logging**: Use structured loggers (Winston, Pino) instead of `console.error` in production.
- **Custom Error Objects**: Throw custom error objects (e.g., `AppError` with status codes) rather than generic Error instances.

**Rationale**: Consistent error handling improves debugging and user experience. Structured logging enables log aggregation and analysis in production environments.

### VI. Type Safety & Validation
- **TypeScript Strict Mode**: If using TypeScript, strict mode MUST be enabled. If using plain JavaScript, use JSDoc for complex function signatures.
- **Input Validation**: ALL incoming data (body, params, query) MUST be validated using Zod or Joi before reaching the service layer.

**Rationale**: Type safety catches errors at compile time. Input validation prevents invalid data from corrupting business logic or database state.

### VII. Code Quality Standards
- **DRY (Don't Repeat Yourself)**: Abstract repeated logic into utility functions or shared middleware.
- **Selective Fetching**: Always use Prisma's `select` to return only fields needed by the client. Avoid returning entire documents or sensitive fields.
- **Indexing**: Fields used in `where` clauses, sorting, or filtering MUST be indexed in `schema.prisma` using `@@index`.

**Rationale**: DRY reduces maintenance burden. Selective fetching improves performance and security. Proper indexing ensures query performance at scale.

### VIII. Frontend Architecture (NON-NEGOTIABLE)
The frontend MUST follow a clear separation of concerns:
- **API Layer**: All API interactions MUST use React Query (TanStack Query) for server state management. Axios client MUST be centralized with interceptors.
- **State Management**: Server state via React Query, client state via Zustand. NO mixing of state management patterns.
- **Component Structure**: Server Components by default (Next.js App Router), Client Components only when necessary (interactivity, hooks, browser APIs).
- **Type Safety**: All API types MUST be defined using Zod schemas with type inference. Types MUST be in `types/` folder.

**Rationale**: Clear separation prevents state management confusion and ensures predictable data flow. Server Components reduce client bundle size and improve performance.

### IX. Frontend API Layer Standards
- **Endpoint Constants**: NEVER hardcode API endpoints in query/mutation files. All endpoints MUST be defined in `endpoints.ts` files.
- **Query Keys**: React Query query keys MUST follow a hierarchical pattern using factory functions (e.g., `userKeys.lists()`, `userKeys.detail(id)`).
- **Explicit Return Types**: All exported hooks from shared packages MUST have explicit return types (e.g., `UseQueryResult<T, AxiosError>`) to ensure type portability in monorepo.

**Rationale**: Centralized endpoints prevent broken references. Hierarchical query keys enable efficient cache invalidation. Explicit types ensure type portability across monorepo packages.

### X. Frontend UI Standards
- **Component Library**: MUST use shadcn/ui components built on Radix UI for accessibility and consistency.
- **Styling**: MUST use Tailwind CSS with semantic utility classes. NO hardcoded color classes (e.g., `text-red-500`). Use semantic classes (`text-destructive`, `bg-primary`).
- **DRY in UI**: Iterate over configuration arrays/objects instead of repeating JSX. Extract repetitive patterns into atomic components.

**Rationale**: shadcn/ui provides accessible, customizable components. Semantic styling ensures theme consistency. DRY reduces maintenance and ensures consistency.

### XI. React & Next.js Rules
- **Rules of Hooks**: MUST follow React Rules of Hooks without exception. Hooks MUST be called at the top level, before any early returns.
- **Dependency Arrays**: MUST include all variables used inside hooks in dependency arrays. Use ESLint plugin for guidance.
- **Form Validation**: MUST use React Hook Form with Zod resolver for all forms. Validation schemas MUST be in `types/` folder.
- **Package Versions**: MUST use latest compatible versions for all packages. No deprecated or outdated packages allowed.

**Rationale**: Rules of Hooks violations cause runtime errors. Proper dependency arrays prevent stale closures. React Hook Form + Zod provides type-safe validation.

## Monorepo Architecture

### Structure
The project MUST use **Turborepo** for monorepo management with the following structure:
- **Apps**: `apps/backend/` (existing backend), `apps/frontend/` (Next.js frontend)
- **Packages**: Shared packages in `packages/` (e.g., `@repo/api-beacon`, `@repo/ui`)
- **Root**: Turborepo configuration at repository root

### Package Standards
- **Naming**: Shared packages MUST use `@repo/` prefix (e.g., `@repo/api-beacon`)
- **Exports**: All packages MUST define `.` export pointing to `./src/index.ts`
- **Peer Dependencies**: Large libraries (axios, @tanstack/react-query) MUST be listed as both `dependencies` and `peerDependencies`
- **Type Portability**: Exported hooks MUST have explicit return types to ensure type portability across packages

**Rationale**: Turborepo enables efficient builds and shared code. Consistent naming and structure improves developer experience. Type portability prevents build errors.

## Technology Stack

### Backend Technologies
- **Runtime**: Node.js with async/await (no callback hell or raw `.then()` chains)
- **ORM**: Prisma with MongoDB
- **Database**: MongoDB with explicit ObjectId mapping (`@id @map("_id") @db.ObjectId`)
- **Validation**: Zod or Joi for input validation
- **Authentication**: `jsonwebtoken` for JWT handling
- **Password Hashing**: `bcrypt` or `argon2`
- **Logging**: Winston or Pino (structured logging)
- **Environment**: `dotenv` for environment variable management

### Frontend Technologies
- **Framework**: Next.js (App Router) - latest version
- **UI Library**: React - latest version
- **Styling**: Tailwind CSS - latest version
- **Component Library**: shadcn/ui (built on Radix UI)
- **Server State**: React Query (TanStack Query) - latest version
- **Client State**: Zustand - latest version
- **Forms**: React Hook Form with Zod resolver - latest versions
- **HTTP Client**: Axios - latest version
- **Validation**: Zod - latest version
- **Monorepo**: Turborepo - latest version

**Package Version Policy**: All packages MUST use the latest compatible versions. No deprecated or outdated packages allowed.

### Naming Conventions
- **Variables/Functions**: `camelCase`
- **Files**: `kebab-case.js`
- **Classes/Models**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`

### Comments
Comment *why* complex logic exists, not *what* the code is doing. Self-documenting code is preferred.

## Development Workflow

### Backend Code Organization
- Controllers in `src/controllers/` or `src/api/controllers/`
- Services in `src/services/`
- Repositories/Data Access in `src/repositories/` or `src/dal/`
- Models/Schemas defined in Prisma schema file
- Utilities in `src/lib/` or `src/utils/`

### Frontend Code Organization
- **App Router**: Next.js App Router structure in `app/` directory
- **Components**: Reusable components in `components/` (shadcn/ui in `components/ui/`, custom in `components/shared/`)
- **API Layer**: API client, queries, mutations in `api/` directory
- **State Management**: Zustand stores in `stores/` directory
- **Types**: All TypeScript types in `types/` directory (Zod schemas with type inference)
- **Hooks**: Custom React hooks in `hooks/` directory
- **Utilities**: Helper functions in `lib/` directory
- **Documentation**: Project documentation in `documentation/` folder at root level

### Monorepo Structure
```
/
├── apps/
│   ├── backend/          # Existing backend application
│   └── frontend/          # Next.js frontend application
├── packages/              # Shared packages
│   ├── api-beacon/        # Beacon API package
│   └── ui/                # Shared UI components
├── turbo.json             # Turborepo configuration
└── package.json           # Root package.json
```

### Environment Variables
Never hardcode secrets. Use environment variables for:

**Backend**:
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- Any API keys or sensitive configuration

**Frontend**:
- `NEXT_PUBLIC_API_URL` - API base URL (exposed to browser)
- Server-only variables (no `NEXT_PUBLIC_` prefix) for sensitive data

### Testing Requirements
- Unit tests for services and utilities
- Integration tests for API endpoints
- Contract tests for external API interactions
- Tests MUST be written before implementation (TDD approach preferred)

## Governance

This constitution supersedes all other coding practices and standards. All PRs and code reviews MUST verify compliance with these principles.

**Amendment Process**:
1. Proposed amendments require documentation of rationale
2. Amendments must be approved before implementation
3. Version number MUST be incremented according to semantic versioning:
   - **MAJOR**: Backward incompatible governance/principle removals or redefinitions
   - **MINOR**: New principle/section added or materially expanded guidance
   - **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements

**Compliance Review**:
- All code must pass constitution checks before merge
- Complexity violations must be justified in PR descriptions
- Use `.specify/memory/constitution.md` as the authoritative source for development guidance

**Version**: 2.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2026-01-21
