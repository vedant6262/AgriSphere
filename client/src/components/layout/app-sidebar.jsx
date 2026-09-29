import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Bell,
  BrainCircuit,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Droplets,
  Landmark,
  LayoutDashboard,
  MapPinned,
  Microscope,
  Settings,
  Sprout,
  TrendingUp,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard, route: true },
  { to: "/app/sensor-monitoring", label: "Sensor Monitoring", icon: Droplets, route: true },
  { to: "/app/crop-recommendation", label: "Crop Recommendation", icon: BrainCircuit, route: true },
  { to: "/app/crop-disease-detection", label: "Crop Disease Detection", icon: Microscope, route: true },
  { to: "/app/disease-risk-map", label: "Disease Risk Map", icon: MapPinned, route: true },
  { to: "/app/market-prices", label: "Market Prices", icon: TrendingUp, route: true },
  { to: "/app/profit-heatmap", label: "Profit Heatmap", icon: MapPinned, route: true },
  { to: "/app/farm-calendar", label: "Farm Calendar", icon: CalendarDays, route: true },
  { to: "/app/expenses", label: "Expense Tracker", icon: CircleDollarSign, route: true },
  { to: "/app/community", label: "Community", icon: Users, route: true },
  { to: "/app/government-schemes", label: "Government Schemes", icon: Landmark, route: true },
  { to: "/app/knowledge-hub", label: "Knowledge Hub", icon: BrainCircuit, route: true },
  { to: "/app/settings", label: "Settings", icon: Settings, route: true }
];

export function AppSidebar({ mobile = false, collapsed = false, onToggleCollapse, onCloseMobile }) {
  const location = useLocation();

  const isItemActive = (item) => {
    return location.pathname === item.to;
  };

  return (
    <aside
      className={cn(
        "glass-card min-h-[calc(100vh-2rem)] shrink-0 rounded-[2rem] p-4 transition-all duration-300",
        collapsed && !mobile ? "w-[88px]" : "w-72",
        mobile ? "flex flex-col" : "hidden lg:flex lg:flex-col"
      )}
    >
      <div className="mb-6 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Sprout className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-display text-lg font-semibold">AgriSphere</p>
              <p className="text-sm text-muted-foreground">Climate-smart farming</p>
            </div>
          )}
        </div>
        {!mobile && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/70 text-muted-foreground transition hover:bg-muted"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      <nav className="custom-scrollbar flex-1 space-y-1 overflow-auto pr-1">
        {items.map((item) => {
          const { to, label, icon: Icon } = item;
          return (
            <Link
              key={to}
              to={to}
              onClick={() => onCloseMobile?.()}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                "hover:bg-muted/70 hover:translate-x-1",
                isItemActive(item) && "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}

        <NavLink
          to="/app/alerts"
          onClick={() => onCloseMobile?.()}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              "hover:bg-muted/70 hover:translate-x-1",
              isActive && "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            )
          }
        >
          <Bell className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">Alerts</span>}
        </NavLink>
      </nav>

      {!collapsed && (
        <div className="mt-4 rounded-2xl bg-secondary/90 p-4 text-secondary-foreground">
          <p className="font-display text-base">Smart Irrigation Tip</p>
          <p className="mt-2 text-sm opacity-90">
            Pulse irrigation before sunrise reduces evaporative loss when daytime wind exceeds 12 km/h.
          </p>
        </div>
      )}
    </aside>
  );
}
