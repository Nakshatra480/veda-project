# VedaAI Assessment Creator

A full-stack web application for teachers to create assignments and generate AI-powered question papers from structured input. Built with Next.js, Express, MongoDB, Redis, BullMQ, and Socket.IO.

## Architecture

```
vedaai/
├── apps/
│   ├── web/          Next.js 14+ frontend (App Router, TypeScript, Tailwind CSS)
│   └── api/          Express backend (TypeScript, MongoDB, BullMQ, Socket.IO)
├── packages/
│   └── shared/       Shared Zod schemas, types, and constants
├── docker-compose.yml
└── turbo.json
```

### System Flow

1. Teacher creates an assignment through the multi-step wizard
2. Backend stores the assignment in MongoDB and enqueues a generation job
3. BullMQ worker picks up the job and builds a structured prompt
4. Worker calls OpenRouter API (minimax/minimax-m2.5) for question generation
5. Worker parses and validates the JSON response against Zod schemas
6. Validated paper is stored in MongoDB
7. Real-time status updates flow through Socket.IO at every stage
8. Frontend renders the generated paper in an exam-paper layout
9. Teachers can regenerate or download as a formatted PDF

## Prerequisites

- Node.js >= 20.0.0
- Docker and Docker Compose (for MongoDB and Redis)
- An OpenRouter API key

## Quick Start

### 1. Clone and Install

```bash
cd "veda project"
npm install
```

### 2. Start Infrastructure

```bash
docker compose up -d
```

This starts MongoDB (port 27017) and Redis (port 6379).

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your OpenRouter API key:

```
OPENROUTER_API_KEY=your_actual_key_here
```

### 4. Run Development Servers

Start both frontend and backend:

```bash
npm run dev
```

Or run them individually:

```bash
npm run dev:api   # Backend on http://localhost:4000
npm run dev:web   # Frontend on http://localhost:3000
```

### 5. Open the App

Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://localhost:27017/vedaai` | MongoDB connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `OPENROUTER_API_KEY` | — | OpenRouter API key (required) |
| `OPENROUTER_MODEL` | `minimax/minimax-m2.5` | AI model to use |
| `PORT` | `4000` | Backend server port |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed CORS origin |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Backend API URL for frontend |
| `NEXT_PUBLIC_WS_URL` | `http://localhost:4000` | WebSocket URL for frontend |

## Tech Stack

### Frontend
- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component patterns
- **Zustand** for state management
- **React Hook Form + Zod** for form handling and validation
- **Socket.IO Client** for real-time updates
- **Lucide React** for icons

### Backend
- **Express** with TypeScript
- **MongoDB** with Mongoose ODM
- **Redis** as queue broker
- **BullMQ** for background job processing
- **Socket.IO** for WebSocket communication
- **PDFKit** for server-side PDF generation
- **Zod** for request validation

### Shared
- **Zod schemas** shared between frontend and backend
- **TypeScript types** inferred from schemas
- **Constants** for enums and configuration

## Features

- **Multi-step Assignment Creator** — guided wizard with validation
- **AI Question Generation** — powered by OpenRouter with structured prompts
- **Real-time Progress** — live WebSocket updates during generation
- **Exam Paper View** — professional paper layout with sections, marks, difficulty badges
- **PDF Download** — server-generated PDF with proper formatting
- **Regeneration** — one-click regeneration of question papers
- **Responsive Design** — desktop sidebar + mobile bottom navigation
- **Search & Filter** — find assignments by title, subject, or status

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/assignments` | Create a new assignment |
| `GET` | `/api/assignments` | List assignments (search, filter, paginate) |
| `GET` | `/api/assignments/:id` | Get assignment by ID |
| `POST` | `/api/assignments/:id/regenerate` | Regenerate question paper |
| `GET` | `/api/papers/:id` | Get generated question paper |
| `GET` | `/api/papers/:id/pdf` | Download paper as PDF |

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join:assignment` | Client → Server | Join assignment room for updates |
| `assignment:created` | Server → Client | Assignment created |
| `generation:started` | Server → Client | Generation job started |
| `generation:progress` | Server → Client | Progress update with stage info |
| `generation:completed` | Server → Client | Generation finished successfully |
| `generation:failed` | Server → Client | Generation failed with error |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start all apps in development mode |
| `npm run build` | Build all apps |
| `npm run dev:web` | Start frontend only |
| `npm run dev:api` | Start backend only |
| `npm run build:web` | Build frontend |
| `npm run build:api` | Build backend |

## License

Private — All rights reserved.
