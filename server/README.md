# AgriSphere Backend

## Overview
This is the Express + Prisma backend for AgriSphere. It serves dashboard, community, expenses, alerts, and settings APIs and integrates external agriculture data services.

## Tech Stack
- Node.js (ESM)
- Express
- Prisma ORM
- PostgreSQL (local or Neon)
- Zod validation
- Clerk middleware for auth

## Run Backend
1. Install dependencies from project root:
   npm install
2. Start backend only:
   npm run dev --workspace server
3. Backend URL:
   http://localhost:4000
4. Health check:
   GET http://localhost:4000/api/health

## Environment Files
Primary config is read from server/.env.
Template values are in server/.env.example.

Important DB vars:
- DATABASE_URL (local or default DB URL)
- NEON_DATABASE_URL (optional cloud override)

Runtime behavior in src/config/env.js:
- In development, backend prefers LOCAL_DATABASE_URL, then DATABASE_URL, then NEON_DATABASE_URL.
- In production, backend prefers NEON_DATABASE_URL, then DATABASE_URL, then LOCAL_DATABASE_URL.

## Route Map: Which Route Returns Which Data
Base prefix: /api

### Health
- GET /health
  - Controller: inline in src/routes/index.js
  - Returns: { status, service }

### Dashboard
- GET /dashboard/overview
  - Controller: getDashboardOverview
  - Uses services: settings, thingspeak, weather, recommendations, alerts, youtube
  - Returns: { settings, sensorFeed, irrigation, weather, cropRecommendations, cropPrices, alerts, videos }

- GET /dashboard/sensors
  - Controller: getSensors
  - Uses services: settings, thingspeak, recommendations
  - Returns: { sensorFeed, irrigation }

- GET /dashboard/weather
  - Controller: getWeather
  - Uses service: weather
  - Returns: weather payload

- GET /dashboard/recommendations
  - Controller: getRecommendations
  - Uses service: recommendations
  - Returns: { recommendations }

- GET /dashboard/prices
  - Controller: getCropPrices
  - Uses service: recommendations (price trends)
  - Returns: { prices }

- GET /dashboard/videos
  - Controller: getVideos
  - Uses service: youtube
  - Returns: { videos }

- POST /dashboard/chat
  - Controller: postChatMessage
  - Input body: { messages: [...] }
  - Uses services: settings, openai
  - Returns: { answer }

- POST /dashboard/disease-analysis
  - Controller: postDiseaseAnalysis
  - Input form-data: image file field named image
  - Uses service: disease
  - Returns: disease analysis object

- POST /dashboard/disease-risk-map
  - Controller: postDiseaseRiskMap
  - Input form-data: image file field named image
  - Uses service: disease-risk
  - Returns: PlantSeg mask-derived A1-C3 zone percentages, risk levels, most affected zone, and overall risk

### PlantSeg segmentation integration
`DISEASE_SEGMENTATION_API_URL` should point to the fine-tuned PlantSeg inference service trained with paired disease images and masks. The service accepts multipart field `image` and returns a JSON 2D binary/probability mask:

```json
{ "mask": [[0, 0.8], [1, 0]] }
```

Values greater than `0.5` are counted as infected pixels. The backend splits that mask into the A1-C3 grid, calculates affected percentages, assigns LOW (<5%), MODERATE (5 to <15%), HIGH (15 to <30%), or SEVERE (>=30%), and stores the result in `DiseaseRiskAnalysis`. The endpoint returns a configuration or upstream error when the model URL is absent or unavailable; it does not generate synthetic risk results.

### Community
- GET /community/posts
  - Controller: getCommunityPosts
  - Uses service: community list
  - Returns: { posts }

- POST /community/posts
  - Controller: createPost
  - Validated input: { authorName, title, content }
  - Uses service: community create
  - Returns: { post }

### Expenses
- GET /expenses
  - Controller: getExpenses
  - Uses service: expenses list
  - Returns: { expenses, monthlyTotals }

- POST /expenses
  - Controller: createExpenseEntry
  - Validated input: { category, amount, month, year, notes }
  - Uses service: expenses create
  - Returns: { expense }

### Alerts
- GET /alerts
  - Controller: getAlerts
  - Uses service: alerts list
  - Returns: { alerts }

- POST /alerts/:id/acknowledge
  - Controller: acknowledge
  - Uses service: alerts acknowledge
  - Returns: { alert }

### Settings
- GET /settings
  - Controller: getSettings
  - Uses service: settings get/upsert helpers
  - Returns: { settings }

- PUT /settings
  - Controller: updateSettings
  - Validated input: farm and sensor fields
  - Uses service: settings upsert
  - Returns: { settings }

## Where To Change Backend Data Flow
If you want to change what data each endpoint returns, edit in this order:

1. Route path and method:
   src/routes/*.routes.js
2. Request parsing/response shape:
   src/controllers/*.controller.js
3. Business logic and third-party calls:
   src/services/*.service.js
4. Database queries and model persistence:
   src/services/* + prisma/schema.prisma
5. Auth requirement per endpoint:
   src/routes/* (requireUser) and src/middleware/auth.js

## Database and Prisma
Schema file:
- prisma/schema.prisma

Typical commands:
- npm run prisma:generate --workspace server
- npm run prisma:migrate --workspace server

## Quick Change Guide (Examples)
- Change weather response fields:
  src/controllers/dashboard.controller.js (getWeather or getDashboardOverview)
- Change expense payload validation:
  src/controllers/expenses.controller.js (expenseSchema)
- Change community post validation:
  src/controllers/community.controller.js (createPostSchema)
- Change where crop prices come from:
  src/services/recommendations.service.js

## Security Notes
- Keep real secrets in server/.env only.
- Do not commit production secrets in server/.env.example.
- Neon connection strings should include sslmode=require.
