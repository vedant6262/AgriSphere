import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { useAppAuth } from "@/context/auth-context";
import { LandingPage } from "@/pages/LandingPage";
import { SignInPage } from "@/pages/SignInPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { AlertsPage } from "@/pages/dashboard/AlertsPage";
import { CommunityPage } from "@/pages/dashboard/CommunityPage";
import { CropDiseaseDetectionPage } from "@/pages/dashboard/CropDiseaseDetectionPage";
import { DiseaseRiskMapPage } from "@/pages/dashboard/DiseaseRiskMapPage";
import { CropRecommendationPage } from "@/pages/dashboard/CropRecommendationPage";
import { ExpensesPage } from "@/pages/dashboard/ExpensesPage";
import { FarmCalendarPage } from "@/pages/dashboard/FarmCalendarPage";
import { FarmMonitoringPage } from "@/pages/dashboard/FarmMonitoringPage";
import { GovernmentSchemesPage } from "@/pages/dashboard/GovernmentSchemesPage";
import { KnowledgeHubPage } from "@/pages/dashboard/KnowledgeHubPage";
import { MarketPricesPage } from "@/pages/dashboard/MarketPricesPage";
import { OverviewPage } from "@/pages/dashboard/OverviewPage";
import { ProfitHeatmapPage } from "@/pages/dashboard/ProfitHeatmapPage";
import { SettingsPage } from "@/pages/dashboard/SettingsPage";

function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAppAuth();

  if (!isLoaded) {
    return <div className="p-6 text-sm text-muted-foreground">Checking authentication...</div>;
  }

  return isSignedIn ? <Outlet /> : <Navigate to="/sign-in" replace />;
}

function AuthOnlyRoute() {
  const { isLoaded, isSignedIn } = useAppAuth();

  if (!isLoaded) {
    return <div className="p-6 text-sm text-muted-foreground">Checking authentication...</div>;
  }

  return isSignedIn ? <Navigate to="/app/dashboard" replace /> : <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<AuthOnlyRoute />}>
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<OverviewPage />} />
          <Route path="farm-monitoring" element={<FarmMonitoringPage />} />
          <Route path="sensor-monitoring" element={<FarmMonitoringPage />} />
          <Route path="crop-recommendation" element={<CropRecommendationPage />} />
          <Route path="crop-disease-detection" element={<CropDiseaseDetectionPage />} />
          <Route path="disease-risk-map" element={<DiseaseRiskMapPage />} />
          <Route path="market-prices" element={<MarketPricesPage />} />
          <Route path="profit-heatmap" element={<ProfitHeatmapPage />} />
          <Route path="knowledge-hub" element={<KnowledgeHubPage />} />
          <Route path="government-schemes" element={<GovernmentSchemesPage />} />
          <Route path="farm-calendar" element={<FarmCalendarPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
