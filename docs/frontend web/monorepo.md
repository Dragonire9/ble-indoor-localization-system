---
trigger: always_on
---

# Monorepo Development Rules

This guide defines the standards for adding and maintaining shared packages within our monorepo.

---

## 🛑 PRIME DIRECTIVE: Type Portability

**Instruction:** You must ensure that all exported functions and hooks from shared packages have **explicit return types**.

### Why this matters

Turborepo and TypeScript generate declaration files (`.d.ts`) for packages. If a return type is inferred but depends on a private or internal type from a dependency (like `@tanstack/react-query`), the resulting type might not be "portable," causing errors in the consuming application.

### The Rule

- **Never** rely on type inference for exported hooks (e.g., `useQuery`, `useMutation`).
- **Always** import and use the explicit Result types from the library.

**Bad (Inferred):**

```typescript
export const useUser = (id: string) => {
  return useQuery({ ... });
};
```

**Good (Explicit):**

```typescript
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { type AxiosError } from "axios";

export const useUser = (id: string): UseQueryResult<User, AxiosError> => {
  return useQuery({ ... });
};
```

---

## 📦 Package Structure

### Folder Layout

```text
packages/<package-name>/
├── src/
│   ├── index.ts        # Main entry point (barrel exports)
│   ├── types.ts        # Zod schemas and inferred types
│   ├── endpoints.ts    # API URL constants
│   ├── queries.ts      # React Query query hooks
│   └── mutations.ts    # React Query mutation hooks
├── package.json
└── tsconfig.json
```

### package.json Standards

1. **Naming:** Use the `@repo/` prefix (e.g., `@repo/api-financial`).
2. **Exports:** Always define `.` export pointing to `./src/index.ts`.
3. **Peer Dependencies:** List large libraries like `axios` and `@tanstack/react-query` as both `dependencies` and `peerDependencies`.

---

## 🧹 Clean Implementation

- **Avoid Barrel Exports inside `src`:** Prefer direct imports between files within the package to avoid circular dependencies. Only use `index.ts` for the public API.
- **Consistency:** Follow the pattern of existing packages like `api-media` and `ui`.
- **Validation:** Always run `npm run check-types --workspace=@repo/<package-name>` inside the package after making changes.
