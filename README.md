# AgriSphere

AgriSphere is a full-stack climate-smart farming platform built with React, Vite, Tailwind CSS, shadcn-style UI components, Express, Prisma, PostgreSQL, Clerk, and third-party agriculture data APIs.

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

## Environment Variables

Copy:

- `client/.env.example`
- `server/.env.example`

Then provide:

- Clerk publishable and secret keys
- Neon `DATABASE_URL`
- ThingSpeak channel and read API key
- OpenWeather API key
- Mapbox token
- Plant disease API URL and key
- OpenAI API key and model
- YouTube Data API key

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

## Notes

- The backend includes demo fallbacks when API keys are missing, so the UI still renders with representative data.
- Clerk is optional in local demo mode. Add `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to enable real authentication.
- The OpenAI chatbot endpoint is implemented with the Responses API shape and falls back to demo agronomy guidance when no key is configured.
