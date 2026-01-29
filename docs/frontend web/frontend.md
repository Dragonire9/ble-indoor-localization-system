---
trigger: always_on
---

# Frontend Development Rules

This guide defines the standards and conventions AI agents must follow when writing frontend code in our projects.

> **Related guides:** See `frontend-api.md`, `frontend-nextjs.md`, and `frontend-state.md` for detailed conventions.

---

## Technology Stack

| Library                          | Purpose                                             |
| -------------------------------- | --------------------------------------------------- |
| **Next.js**                      | React framework (App Router)                        |
| **React**                        | UI Framework                                        |
| **Tailwind CSS**                 | Utility-first CSS styling                           |
| **shadcn/ui**                    | Component library built on Radix UI                 |
| **React Hook Form**              | Form state management and validation                |
| **React Query (TanStack Query)** | Server state management, data fetching, and caching |
| **Axios**                        | HTTP client for API requests                        |
| **Zustand**                      | Lightweight client state management                 |
| **Zod**                          | Schema validation and TypeScript type inference     |

---

## Project Structure Overview

```text
/
├── app/                    # Next.js App Router
├── components/             # Reusable components
│   ├── ui/                 # shadcn/ui components
│   └── shared/             # Custom shared components
├── lib/                    # Utility functions
├── api/                    # API layer (client, queries, mutations)
├── stores/                 # Zustand stores
├── types/                  # TypeScript types
├── hooks/                  # Custom React hooks
└── documentation/          # Project documentation
```

---

## Types Location

All TypeScript types must be in the `types/` folder. Use Zod for validation with inferred types.

```typescript
// types/user.ts
import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(["admin", "user", "guest"]),
});

export type User = z.infer<typeof userSchema>;
```

---

## Documentation Location

All documentation must be in the `documentation/` folder at root level.

---

## Summary Checklist

- [ ] Use **Next.js App Router** for all projects
- [ ] Use **shadcn/ui** components for UI elements
- [ ] Use **Tailwind CSS** for styling
- [ ] Use **React Hook Form** + **Zod** for forms
- [ ] Use **React Query** + **Axios** for all server data fetching
- [ ] Use **Zustand** for client-side state management
- [ ] Configure Axios in `api/client.ts` with interceptors
- [ ] Place API logic in `api/<entity>/` with separate files for endpoints, queries, and mutations
- [ ] Place Zustand stores in `stores/` folder
- [ ] Define all types in the `types/` folder
- [ ] Store documentation in the `documentation/` folder at root level
- [ ] Never hardcode API endpoints in query/mutation files
- [ ] Use `"use client"` directive only when necessary
- [ ] Wrap providers in a dedicated `Providers` component
