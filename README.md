# BLE Indoor Localization System

A monorepo for a BLE (Bluetooth Low Energy) beacon-based indoor localization and monitoring system. The system receives telemetry data from ESP32 beacons via MQTT, stores data in MongoDB, and provides a real-time monitoring dashboard.

## 🏗️ Architecture

This is a **Turborepo monorepo** containing:

- **Backend** (`apps/backend`): Express.js API server with MQTT integration, WebSocket support, and Better Auth authentication
- **Frontend** (`apps/frontend`): Next.js 16 monitoring dashboard with real-time updates

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 10+
- MongoDB (local or cloud)
- MQTT broker (optional, for beacon data)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Backend (`apps/backend/.env`):
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   # Edit with your MongoDB connection string and other settings
   ```
   
   Frontend (`apps/frontend/.env`):
   ```bash
   cp apps/frontend/.env.example apps/frontend/.env
   # Edit with your API URL
   ```

3. **Set up database:**
   ```bash
   cd apps/backend
   npx prisma generate
   npx prisma db push
   ```

4. **Set up Better Auth (authentication):**
   ```bash
   cd apps/backend
   npx @better-auth/cli generate
   npx prisma db push
   npx prisma generate
   ```

5. **Set up Better Auth and create default admin user:**
   
   First, generate Better Auth schema:
   ```bash
   cd apps/backend
   npx @better-auth/cli generate
   npx prisma db push
   npx prisma generate
   ```
   
   Then create the default admin user (make sure backend is running):
   
   **Windows (PowerShell):**
   ```powershell
   # Option 1: Using the PowerShell script
   cd apps/backend
   .\scripts\create-user.ps1
   
   # Option 2: Using npm script
   npm run seed:user
   
   # Option 3: Using Invoke-RestMethod (PowerShell)
   $body = @{email="admin@example.com";password="admin123";name="Admin User"} | ConvertTo-Json
   Invoke-RestMethod -Uri "http://localhost:8000/api/auth/sign-up/email" -Method Post -Body $body -ContentType "application/json"
   ```
   
   **Linux/Mac (Bash):**
   ```bash
   # Option 1: Using the npm script
   npm run seed:user
   
   # Option 2: Using curl
   curl -X POST http://localhost:8000/api/auth/sign-up/email \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"admin123","name":"Admin User"}'
   ```
   
   Default credentials:
   - **Email**: `admin@example.com`
   - **Password**: `admin123`
   
   ⚠️ **Note**: If the user already exists, you can use these credentials to login directly.

6. **Start development servers:**
   ```bash
   # From root directory
   npm run dev
   ```
   
   This will start:
   - Backend on `http://localhost:8000`
   - Frontend on `http://localhost:3000`

## 📁 Project Structure

```
BLE/
├── apps/
│   ├── backend/          # Express.js API server
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── lib/
│   │   │   └── middleware/
│   │   ├── prisma/
│   │   └── package.json
│   └── frontend/         # Next.js dashboard
│       ├── app/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── package.json
├── specs/                 # Feature specifications
├── package.json          # Root package.json
├── turbo.json            # Turborepo configuration
└── README.md            # This file
```

## 🔧 Development

### Running Individual Apps

```bash
# Backend only
cd apps/backend
npm run dev

# Frontend only
cd apps/frontend
npm run dev
```

### Database Management

```bash
cd apps/backend

# Generate Prisma Client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio

# Seed database with sample data
npm run seed
```

### Building for Production

```bash
# Build all apps
npm run build

# Build individual apps
cd apps/backend && npm run build
cd apps/frontend && npm run build
```

## 🔐 Authentication

The system uses **Better Auth** for authentication:

- **Backend**: Session-based authentication with MongoDB
- **Frontend**: Client-side session management with automatic cookie handling

### Default Login Credentials

After running `npm run seed:user` in the backend:

- **Email**: `admin@example.com`
- **Password**: `admin123`

⚠️ **Important**: Change the default password in production!

## 📡 MQTT Setup (Optional)

The backend can receive beacon data via MQTT. To set up MQTT broker:

### Using Docker (Recommended)

```bash
# Run Mosquitto in Docker
docker run -it -p 1883:1883 eclipse-mosquitto
```

### Using WSL (Windows)

See `apps/backend/scripts/README-mosquitto-wsl.md` for detailed instructions.

## 📚 Documentation

- **Backend API**: See `apps/backend/README.md`
- **Frontend**: See `apps/frontend/README.md`
- **API Documentation**: Available at `http://localhost:8000/api-docs` (Swagger UI) when backend is running

## 🛠️ Tech Stack

### Backend
- Node.js + TypeScript
- Express.js
- Prisma ORM + MongoDB
- MQTT.js (for beacon communication)
- Socket.io (for real-time updates)
- Better Auth (authentication)
- Zod (validation)
- Winston (logging)

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Shadcn/ui (component library)
- React Query (TanStack Query)
- Zustand (state management)
- Socket.io-client (real-time updates)
- Better Auth React (authentication)
- React Hook Form + Zod (forms)

## 📝 Scripts

### Root Level
- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps
- `npm run lint` - Lint all apps
- `npm run format` - Format code with Prettier

### Backend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run seed` - Seed database with sample data
- `npm run seed:user` - Create default admin user

### Frontend
- `npm run dev` - Start Next.js dev server
- `npm run build` - Build for production
- `npm run start` - Start production server

## 🐛 Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGIN` in backend `.env` is set correctly
- Check that frontend `NEXT_PUBLIC_API_URL` points to backend URL

### Database Connection Issues
- Verify MongoDB connection string in `apps/backend/.env`
- Check that MongoDB is running and accessible

### Authentication Not Working
- Ensure Better Auth schema is generated: `npx @better-auth/cli generate`
- Verify `BETTER_AUTH_SECRET` is set in both backend and frontend `.env` files
- Check that session cookies are being sent (browser DevTools)

### MQTT Connection Issues
- Verify MQTT broker is running
- Check `MQTT_BROKER_URL` in backend `.env`
- Backend will continue to work without MQTT (API endpoints remain functional)

## 📄 License

Private project - All rights reserved
