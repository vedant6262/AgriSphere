import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Bell, CalendarDays, Menu, PanelLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppAuth } from "@/context/auth-context";
import { alertsApi } from "@/services/api";
import { useAlertsStream } from "@/hooks/use-alerts-stream";

export function DashboardHeader({ onToggleMenu, onToggleSidebar, isSidebarCollapsed }) {
  const navigate = useNavigate();
  const { isClerkEnabled, user, signOut, getToken } = useAppAuth();
  const userInitial = user?.firstName?.[0] || user?.username?.[0] || "F";
  const [alertCount, setAlertCount] = useState(0);

  useAlertsStream(getToken, (nextAlerts) => {
    const unread = (Array.isArray(nextAlerts) ? nextAlerts : []).filter((alert) => !alert.acknowledged).length;
    setAlertCount(unread);
  });

  useEffect(() => {
    let active = true;

    const loadAlerts = async () => {
      try {
        const response = await alertsApi.list(getToken);
        const unread = (response.alerts || []).filter((alert) => !alert.acknowledged).length;
        if (active) {
          setAlertCount(unread);
        }
      } catch {
        if (active) {
          setAlertCount(0);
        }
      }
    };

    loadAlerts();

    return () => {
      active = false;
    };
  }, [getToken]);

  return (
    <header className="glass-card sticky top-3 z-30 mb-5 flex flex-wrap items-center gap-3 rounded-[2rem] px-3 py-3 shadow-[0_18px_45px_rgba(16,24,40,0.08)] backdrop-blur-2xl sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button type="button" onClick={onToggleMenu} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background/70 lg:hidden">
          <Menu className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden h-10 w-10 items-center justify-center rounded-xl border border-border bg-background/70 text-muted-foreground lg:inline-flex"
        >
          <PanelLeft className={`h-4 w-4 transition ${isSidebarCollapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div className="hidden items-center gap-2 xl:flex">
        <NavLink
          className={({ isActive }) =>
            `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              isActive ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "border-border bg-background/70 hover:bg-muted"
            }`
          }
          to="/app/farm-calendar"
        >
          <CalendarDays className="h-4 w-4" />
          Calendar
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              isActive ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "border-border bg-background/70 hover:bg-muted"
            }`
          }
          to="/app/community"
        >
          <Users className="h-4 w-4" />
          Community
        </NavLink>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="relative h-10 w-10 rounded-xl px-0" onClick={() => navigate("/app/alerts")}>
          <Bell className="h-4 w-4" />
          {alertCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
              {alertCount > 99 ? "99+" : alertCount}
            </span>
          ) : null}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="h-10 rounded-xl px-3"
          onClick={() => (isClerkEnabled ? signOut?.() : navigate("/"))}
        >
          <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-xs font-semibold text-foreground">
            {userInitial.toUpperCase()}
          </span>
          <span className="hidden sm:inline">{isClerkEnabled ? "Sign out" : "Home"}</span>
        </Button>
      </div>
    </header>
  );
}
