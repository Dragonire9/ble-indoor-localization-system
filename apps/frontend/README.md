# BLE Monitoring Dashboard - Frontend

Next.js 16 frontend application for monitoring and managing BLE beacons, geofences, and sectors in real-time.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Backend server running on `http://localhost:8000`
- MongoDB database (managed by backend)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   BETTER_AUTH_URL=http://localhost:8000
   BETTER_AUTH_SECRET=your-secret-key-here-change-in-production
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   Application will be available at `http://localhost:3000`

## 🔐 Authentication

The application uses **Better Auth** for authentication. Default login credentials:

- **Email**: `admin@example.com`
- **Password**: `admin123`

⚠️ **Note**: Create the default user by running `npm run seed:user` in the backend directory first.

## 📁 Project Structure

```
apps/frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   │   └── login/
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── dashboard/
│   │   ├── beacons/
│   │   ├── geofences/
│   │   └── sectors/
│   ├── api/               # API routes (Better Auth handler)
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── beacons/         # Beacon-related components
│   ├── geofences/       # Geofence-related components
│   ├── sectors/         # Sector-related components
│   └── layout/          # Layout components (Header, Sidebar)
├── hooks/                # Custom React hooks
│   ├── use-beacons.ts
│   ├── use-beacon-websocket.ts
│   └── ...
├── lib/                  # Utility libraries
│   ├── api/             # API client (Axios)
│   ├── auth.ts          # Better Auth server instance
│   ├── auth-client.ts   # Better Auth client instance
│   ├── websocket.ts     # Socket.io client
│   └── utils.ts         # Utility functions
├── stores/              # Zustand stores
├── types/               # TypeScript types and Zod schemas
└── providers/          # React context providers
```

## 🎨 UI Components

The application uses **Shadcn/ui** components built on Radix UI and Tailwind CSS v4:

- **Button** - Various button variants
- **Input** - Form inputs with validation
- **Card** - Content containers
- **Dialog** - Modal dialogs
- **Table** - Data tables
- **Select** - Dropdown selects
- **Alert Dialog** - Confirmation dialogs
- **Empty State** - Empty state displays
- **Badge** - Status badges
- **Skeleton** - Loading state placeholders
- **Avatar** - User avatars
- **Tooltip** - Tooltip components

## 🔄 Real-time Updates

The application uses **Socket.io** for real-time updates:

- **Beacon Updates**: Connection state, power state, telemetry data
- **Geofence Updates**: Create, update, delete events
- **Sector Updates**: Changes to sectors

WebSocket connection is automatically managed by custom hooks:
- `useBeaconWebSocket` - Subscribes to beacon events
- `useGeofenceWebSocket` - Subscribes to geofence events

## 📊 Data Management

### React Query (TanStack Query)

All API data fetching uses React Query for:
- Automatic caching
- Background refetching
- Optimistic updates
- Error handling

### State Management

- **React Query**: Server state (API data)
- **Zustand**: Client state (filters, UI state)
- **React Hook Form**: Form state

## ✨ Polish Features

### Loading States
- Skeleton components for consistent loading UI across all pages
- Automatic loading states for all data fetching operations

### Error Handling
- Error boundaries for graceful error recovery
- User-friendly error messages with retry options

### Date Formatting
- Consistent timezone-aware date formatting using `lib/date-utils.ts`
- Relative time formatting (e.g., "2 hours ago")
- Short and full date format options

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server on port 3000

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |
| `BETTER_AUTH_URL` | Better Auth base URL | `http://localhost:8000` |
| `BETTER_AUTH_SECRET` | Better Auth secret key | Required |

## 🎯 Features

### Dashboard
- Real-time beacon monitoring
- Connection state indicators
- Battery level monitoring
- Filter by sector and connection state

### Beacon Management
- List all beacons with filtering
- Create new beacons
- Edit beacon details
- Delete beacons
- View beacon details and telemetry history

### Geofence Management
- List all geofences with map visualization
- Create geofences with polygon coordinates
- Edit geofence polygons
- Delete geofences
- Canvas-based indoor map visualization

### Sector Management
- List all sectors
- Create new sectors
- Edit sector details
- Delete sectors (with validation)
- View sector details with associated beacons and geofences

## 🔧 Configuration

### Tailwind CSS v4

The project uses Tailwind CSS v4 with:
- CSS-first configuration via `@theme` (in `globals.css`)
- PostCSS plugin: `@tailwindcss/postcss`
- Custom color variables for shadcn/ui compatibility

### Better Auth

Authentication is configured in:
- `lib/auth.ts` - Server-side instance (for API routes)
- `lib/auth-client.ts` - Client-side instance (for React components)

## 🐛 Troubleshooting

### Build Errors

If you see Tailwind CSS errors:
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Authentication Issues

- Verify `BETTER_AUTH_SECRET` matches backend
- Check browser console for CORS errors
- Verify session cookies are being set (DevTools → Application → Cookies)

### API Connection Issues

- Verify `NEXT_PUBLIC_API_URL` points to running backend
- Check backend is running on port 8000
- Verify CORS is configured in backend

### WebSocket Connection Issues

- Verify backend Socket.io server is running
- Check WebSocket URL matches backend URL
- Verify CORS allows WebSocket connections

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Shadcn/ui Documentation](https://ui.shadcn.com)
- [Better Auth Documentation](https://www.better-auth.com)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
