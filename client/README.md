# AgriSphere Frontend

## Overview
This is the React + Vite frontend for AgriSphere. It renders the SaaS dashboard UI, handles route navigation, and consumes backend APIs from the server app.

## Tech Stack
- React 18
- React Router v6
- Vite
- TailwindCSS
- Framer Motion
- Chart.js (via react-chartjs-2)
- Mapbox GL JS
- React Big Calendar

## Run Frontend
1. Install dependencies from project root:
   npm install
2. Start frontend only:
   npm run dev --workspace client
3. Frontend URL:
   http://localhost:5173

## Frontend Routing
Main route wiring is in src/App.jsx.

- /app/dashboard -> OverviewPage
- /app/farm-monitoring -> FarmMonitoringPage
- /app/smart-irrigation -> SmartIrrigationPage
- /app/weather-intelligence -> WeatherIntelligencePage
- /app/crop-recommendation -> CropRecommendationPage
- /app/crop-disease-detection -> CropDiseaseDetectionPage
- /app/farm-map -> FarmMapPage
- /app/market-prices -> MarketPricesPage
- /app/ai-chatbot -> AIChatbotPage
- /app/knowledge-hub -> KnowledgeHubPage
- /app/farm-calendar -> FarmCalendarPage
- /app/expenses -> ExpensesPage
- /app/community -> CommunityPage
- /app/alerts -> AlertsPage
- /app/settings -> SettingsPage

Layout behavior:
- AppShell keeps sidebar and header persistent.
- Outlet renders only the active page in main content.

## Where To Change Frontend Behavior
1. Sidebar navigation items and active highlighting:
   src/components/layout/app-sidebar.jsx
2. Header quick links:
   src/components/layout/dashboard-header.jsx
3. Route configuration:
   src/App.jsx
4. API base URL and request methods:
   src/services/api.js
5. Page-level composition:
   src/pages/dashboard/*.jsx
6. Feature widgets/cards:
   src/components/**

## API Integration Map (Frontend)
All API requests are centralized in src/services/api.js.

- dashboardApi.getOverview -> GET /dashboard/overview
- dashboardApi.analyzeDisease -> POST /dashboard/disease-analysis
- dashboardApi.sendChat -> POST /dashboard/chat
- communityApi.list -> GET /community/posts
- communityApi.create -> POST /community/posts
- expenseApi.list -> GET /expenses
- expenseApi.create -> POST /expenses
- alertsApi.list -> GET /alerts
- alertsApi.acknowledge -> POST /alerts/:id/acknowledge
- settingsApi.get -> GET /settings
- settingsApi.update -> PUT /settings

## Environment
Set in client/.env (if needed):
- VITE_API_BASE_URL=http://localhost:4000/api
- VITE_CLERK_PUBLISHABLE_KEY=...
- VITE_MAPBOX_ACCESS_TOKEN=...

## Notes
- If backend auth is enabled, most dashboard routes require a valid Clerk token.
- UI falls back to demo mode when keys are missing and ALLOW_DEMO_MODE is true on backend.
