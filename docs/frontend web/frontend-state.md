---
trigger: always_on
description: When dealing with State Management in the application or when using Zustand
---

# Frontend State & Forms Rules

This guide covers Zustand state management and React Hook Form conventions.

---

## Zustand State Management

All stores must be in the `stores/` folder.

### Folder Structure

```text
stores/
├── useAuthStore.ts
├── useUIStore.ts
└── index.ts          # Optional: barrel export
```

### Persisted Store Example

```typescript
// stores/useAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: "auth-storage" },
  ),
);
```

### Non-Persisted Store Example

```typescript
// stores/useUIStore.ts
import { create } from "zustand";

interface UIState {
  isSidebarOpen: boolean;
  theme: "light" | "dark";
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const useUIStore = create<UIState>(set => ({
  isSidebarOpen: true,
  theme: "light",
  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
  setTheme: theme => set({ theme }),
}));
```

### Using Stores

```typescript
import { useAuthStore } from "@/stores/useAuthStore";
import { useUIStore } from "@/stores/useUIStore";

function Header() {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  return (
    <header>
      <button onClick={toggleSidebar}>Toggle</button>
      {user && <button onClick={logout}>Logout</button>}
    </header>
  );
}
```

---

## React Hook Form + Zod

Always integrate React Hook Form with Zod for type-safe validation.

### Type Definitions

```typescript
// types/user.ts
import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(["admin", "user", "guest"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

### Form Component

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserInput } from "@/types/user";

function CreateUserForm() {
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      name: "",
      role: "user",
    },
  });

  const onSubmit = (data: CreateUserInput) => {
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("email")} placeholder="Email" />
      {form.formState.errors.email && <span>{form.formState.errors.email.message}</span>}

      <input {...form.register("name")} placeholder="Name" />
      {form.formState.errors.name && <span>{form.formState.errors.name.message}</span>}

      <button type="submit">Create</button>
    </form>
  );
}
```
