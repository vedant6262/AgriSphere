# AgriSphere

AgriSphere is a full-stack climate-smart farming platform built with React, Vite, Tailwind CSS, shadcn-style UI components, Express, Prisma, PostgreSQL, Clerk, and third-party agriculture data APIs.

The platform brings farm monitoring, crop intelligence, disease analysis, market awareness, and day-to-day farm management into one responsive workspace. It is designed to remain useful in demo mode, even when external API credentials are not configured.

## Highlights

- Climate and sensor monitoring with charts, gauges, and farm maps
- Crop recommendations and crop disease detection workflows
- Disease risk visualization and weather-aware guidance
- Market price intelligence and profit heatmaps
- Farm calendar, expense tracking, alerts, and settings
- Community feed, knowledge hub, video resources, and AI agronomy chat
- Demo-safe fallback data for local development without every integration enabled

## Stack

- Frontend: React, Vite, Tailwind CSS, Chart.js, Mapbox GL JS, Clerk
- Backend: Node.js, Express.js
- Database: PostgreSQL (Neon-ready) with Prisma ORM
- Integrations: ThingSpeak, OpenWeather, Mapbox, plant disease API, OpenAI, YouTube Data API

## Apps

- `client`: startup-style responsive frontend with landing page, auth pages, dashboard, community, expenses, alerts, and settings
- `server`: Express API with Prisma models and fallback-safe integrations for sensor data, weather, chatbot, disease analysis, videos, community posts, alerts, expenses, and farm settings

## Project Structure

```text
.
├── client
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── hooks
│   │   ├── lib
│   │   ├── pages
│   │   └── services
├── server
│   ├── prisma
│   └── src
│       ├── config
│       ├── controllers
│       ├── lib
│       ├── middleware
│       ├── routes
│       ├── services
│       └── utils
└── package.json
```

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- PostgreSQL locally or a Neon PostgreSQL database
- API credentials for any live integrations you want to enable

The application can still be explored in demo mode without most external credentials.

## Environment Variables

Create local environment files from the provided examples:

```bash
# Windows
copy client\.env.example client\.env
copy server\.env.example server\.env

# macOS/Linux
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Then provide the values required for the integrations you want to enable:

- Clerk publishable and secret keys
- Neon `DATABASE_URL`
- ThingSpeak channel and read API key
- OpenWeather API key
- Mapbox token
- Plant disease API URL and key
- OpenAI API key and model
- YouTube Data API key

Keep `.env` files private. The example files intentionally contain placeholders only.

## Architecture

The React/Vite client communicates with the Express API under `/api`. The server coordinates authentication, Prisma persistence, fallback data, and external services. PostgreSQL can run locally or through Neon, while third-party integrations are isolated in backend services so the dashboard can continue rendering when an integration is unavailable.

## Development

Install dependencies:

```bash
npm install
```

Generate Prisma client and migrate:

```bash
npm run prisma:generate --workspace server
npm run prisma:migrate --workspace server
```

Run both apps:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` and backend on `http://localhost:4000`.

Verify the backend is running at `http://localhost:4000/api/health`.

## Available Commands

```bash
# Frontend production build
npm run build --workspace client

# Backend syntax check
npm run build --workspace server

# Run the checks for both workspaces
npm run lint
```

## Notes

- The backend includes demo fallbacks when API keys are missing, so the UI still renders with representative data.
- Clerk is optional in local demo mode. Add `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to enable real authentication.
- The OpenAI chatbot endpoint is implemented with the Responses API shape and falls back to demo agronomy guidance when no key is configured.

