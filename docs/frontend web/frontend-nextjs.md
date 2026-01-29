---
trigger: always_on
---

# Frontend Next.js Rules

This guide covers Next.js App Router conventions and React Query setup.

---

## Project Structure

```text
app/
├── (auth)/             # Route group for auth pages
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/        # Route group for dashboard
│   ├── layout.tsx
│   ├── page.tsx
│   └── users/
│       ├── page.tsx
│       └── [id]/page.tsx
├── layout.tsx          # Root layout
├── page.tsx            # Home page
└── globals.css
```

---

## Client vs Server Components

By default, components in `app/` are **Server Components**. Use `"use client"` only when necessary.

**Server Components:** Data fetching, backend access, sensitive info, large dependencies.

**Client Components:** Interactivity, React hooks, browser APIs, React Query, Zustand.

---

## React Query Setup (TanStack Recommended Pattern)

### Query Client Factory (`lib/get-query-client.ts`)

```typescript
import { QueryClient, defaultShouldDehydrateQuery, isServer } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        shouldDehydrateQuery: query =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
```

### Providers Component (`components/providers.tsx`)

```typescript
"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/lib/get-query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Root Layout (`app/layout.tsx`)

```typescript
import { Providers } from "@/components/providers";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## Server-Side Prefetching

```typescript
// app/(dashboard)/users/page.tsx
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { userKeys } from "@/api/users/queries";
import { apiClient } from "@/api/client";
import { USERS_ENDPOINTS } from "@/api/users/endpoints";
import { UsersList } from "@/components/users/users-list";

export default async function UsersPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: userKeys.lists(),
    queryFn: async () => {
      const { data } = await apiClient.get(USERS_ENDPOINTS.BASE);
      return data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersList />
    </HydrationBoundary>
  );
}
```

---

## Loading and Error States

```typescript
// app/(dashboard)/users/loading.tsx
export default function Loading() {
  return <div>Loading...</div>;
}

// app/(dashboard)/users/error.tsx
("use client");
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

---

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://api.example.com  # Exposed to browser
API_SECRET_KEY=secret                          # Server-only
```
