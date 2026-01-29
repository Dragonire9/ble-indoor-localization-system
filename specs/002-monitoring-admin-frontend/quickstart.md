# Quick Start Guide: Frontend Development

**Date**: 2026-01-21
**Feature**: Monitoring and Administrative Management Frontend

## Prerequisites

- Node.js 18+ installed
- MongoDB running (backend database)
- Backend server running on `http://localhost:3000`
- MQTT broker running (for beacon data ingestion)

## Step 1: Set Up Monorepo Structure

### Initialize Turborepo

```bash
# From repository root
npm install -g turbo
npm install turbo --save-dev
```

### Create Root package.json

```json
{
  "name": "ble-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "latest"
  }
}
```

### Create turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false
    },
    "lint": {
      "dependsOn": ["^lint"]
    }
  }
}
```

## Step 2: Set Up Backend Better Auth Integration

### Install Better Auth

```bash
cd apps/backend
npm install better-auth
```

### Create Auth Configuration

Create `apps/backend/src/lib/auth.ts`:

```typescript
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET!,
});
```

### Generate Better Auth Schema

```bash
npx @better-auth/cli generate
```

This will add Better Auth tables to your Prisma schema. Then:

```bash
npx prisma db push
npx prisma generate
```

### Mount Better Auth Handler

Update `apps/backend/src/app.ts`:

```typescript
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';

// Mount Better Auth handler BEFORE express.json()
app.all('/api/auth/*', toNodeHandler(auth));

// Then mount express.json() for other routes
app.use(express.json());
```

### Environment Variables

Add to `apps/backend/.env`:

```env
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
```

## Step 3: Create Frontend Application

### Initialize Next.js App

```bash
cd apps
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir
cd frontend
```

### Install Dependencies

```bash
npm install @tanstack/react-query axios zustand react-hook-form @hookform/resolvers zod socket.io-client better-auth sonner
npm install -D @types/node
```

### Install shadcn/ui

```bash
npx shadcn@latest init
npx shadcn@latest add sonner
npx shadcn@latest add button input form card table dialog select
```

### Set Up Better Auth Client

Create `apps/frontend/lib/auth-client.ts`:

```typescript
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});
```

### Set Up Better Auth API Route

Create `apps/frontend/app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth.handler);
```

Create `apps/frontend/lib/auth.ts`:

```typescript
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET!,
});
```

### Environment Variables

Create `apps/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-here
```

## Step 4: Set Up API Client

### Create Axios Instance

Create `apps/frontend/lib/api/client.ts`:

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  withCredentials: true, // Important for session cookies
});
```

### Create Endpoint Constants

Create `apps/frontend/lib/api/endpoints.ts`:

```typescript
export const endpoints = {
  beacons: {
    list: '/api/beacons',
    detail: (id: string) => `/api/beacons/${id}`,
    create: '/api/beacons',
    update: (id: string) => `/api/beacons/${id}`,
    delete: (id: string) => `/api/beacons/${id}`,
    telemetry: (id: string) => `/api/beacons/${id}/telemetry`,
  },
  geofences: {
    list: '/api/geofences',
    detail: (id: string) => `/api/geofences/${id}`,
    create: '/api/geofences',
    update: (id: string) => `/api/geofences/${id}`,
    delete: (id: string) => `/api/geofences/${id}`,
  },
  sectors: {
    list: '/api/sectors',
    detail: (id: string) => `/api/sectors/${id}`,
    create: '/api/sectors',
    update: (id: string) => `/api/sectors/${id}`,
    delete: (id: string) => `/api/sectors/${id}`,
  },
} as const;
```

### Create Query Key Factory

Create `apps/frontend/lib/api/query-keys.ts`:

```typescript
export const queryKeys = {
  beacons: {
    all: ['beacons'] as const,
    lists: () => [...queryKeys.beacons.all, 'list'] as const,
    list: (filters?: { sectorId?: string; connectionState?: string }) =>
      [...queryKeys.beacons.lists(), filters] as const,
    details: () => [...queryKeys.beacons.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.beacons.details(), id] as const,
    telemetry: (id: string) => [...queryKeys.beacons.detail(id), 'telemetry'] as const,
  },
  geofences: {
    all: ['geofences'] as const,
    lists: () => [...queryKeys.geofences.all, 'list'] as const,
    list: (filters?: { sectorId?: string; beaconId?: string }) =>
      [...queryKeys.geofences.lists(), filters] as const,
    details: () => [...queryKeys.geofences.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.geofences.details(), id] as const,
  },
  sectors: {
    all: ['sectors'] as const,
    lists: () => [...queryKeys.sectors.all, 'list'] as const,
    list: () => [...queryKeys.sectors.lists()] as const,
    details: () => [...queryKeys.sectors.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.sectors.details(), id] as const,
  },
} as const;
```

## Step 5: Set Up React Query Provider

Create `apps/frontend/providers/query-provider.tsx`:

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

Update `apps/frontend/app/layout.tsx`:

```typescript
import { QueryProvider } from '@/providers/query-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

## Step 6: Set Up WebSocket Client

Create `apps/frontend/lib/websocket.ts`:

```typescript
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
```

## Step 7: Create Login Page

Create `apps/frontend/app/(auth)/login/page.tsx`:

```typescript
'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const { error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Logged in successfully');
      router.push('/dashboard');
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md">
        <h1 className="text-2xl font-bold">Login</h1>
        <Input
          {...register('email')}
          type="email"
          placeholder="Email"
          error={errors.email?.message}
        />
        <Input
          {...register('password')}
          type="password"
          placeholder="Password"
          error={errors.password?.message}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Login'}
        </Button>
      </form>
    </div>
  );
}
```

## Step 8: Run Development Servers

### Start Backend

```bash
cd apps/backend
npm run dev
```

### Start Frontend

```bash
cd apps/frontend
npm run dev
```

### Or Use Turborepo

```bash
# From repository root
npm run dev
```

## Next Steps

1. Create dashboard layout with sidebar navigation
2. Implement beacon monitoring dashboard
3. Implement beacon management pages
4. Implement geofence visualization with indoor map
5. Implement sector management pages
6. Add WebSocket integration for real-time updates
7. Add error handling and loading states
8. Add empty states using shadcn/ui components

## Troubleshooting

### Better Auth Not Working

- Check that `BETTER_AUTH_SECRET` is set in both backend and frontend
- Verify Better Auth handler is mounted before `express.json()`
- Check browser console for CORS errors
- Verify session cookies are being sent (check DevTools)

### WebSocket Connection Fails

- Verify backend Socket.io server is running
- Check that CORS is configured correctly
- Verify WebSocket URL matches backend URL

### API Requests Failing

- Check that `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend server is running
- Check that `withCredentials: true` is set in Axios config
- Verify authentication is working (session cookie present)
