---
trigger: always_on
---

# Frontend API Layer Rules

This guide covers API layer conventions using Axios and React Query.

---

## Folder Structure

```text
api/
├── client.ts           # Axios instance configuration
└── <entity>/
    ├── endpoints.ts    # API endpoint constants
    ├── queries.ts      # React Query query hooks
    └── mutations.ts    # React Query mutation hooks
```

---

## API Client (`api/client.ts`)

Create a centralized Axios instance with interceptors.

```typescript
// api/client.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
```

---

## Endpoints File (`endpoints.ts`)

**Never hardcode endpoint URLs** in query or mutation files.

```typescript
// api/users/endpoints.ts
export const USERS_ENDPOINTS = {
  BASE: "/users",
  BY_ID: (id: string) => `/users/${id}`,
  PROFILE: "/users/profile",
} as const;
```

---

## Queries File (`queries.ts`)

Use React Query for all **GET** requests.

```typescript
// api/users/queries.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client";
import { USERS_ENDPOINTS } from "./endpoints";
import type { User } from "@/types/user";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: object) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: async () => {
      const { data } = await apiClient.get<User[]>(USERS_ENDPOINTS.BASE);
      return data;
    },
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<User>(USERS_ENDPOINTS.BY_ID(id));
      return data;
    },
    enabled: !!id,
  });
};
```

---

## Mutations File (`mutations.ts`)

Use React Query mutations for **POST**, **PUT**, **PATCH**, **DELETE**.

```typescript
// api/users/mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import { USERS_ENDPOINTS } from "./endpoints";
import { userKeys } from "./queries";
import type { CreateUserInput, UpdateUserInput, User } from "@/types/user";

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const { data: user } = await apiClient.post<User>(USERS_ENDPOINTS.BASE, data);
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserInput }) => {
      const { data: user } = await apiClient.patch<User>(USERS_ENDPOINTS.BY_ID(id), data);
      return user;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(USERS_ENDPOINTS.BY_ID(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};
```
