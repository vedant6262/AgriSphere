import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { FloatingAIChat } from "@/components/chat/floating-ai-chat";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useAppAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

export function AppShell() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { getToken } = useAppAuth();

  return (
    <div className="min-h-screen px-3 py-4 md:px-4 md:py-5">
      <div className="mx-auto flex max-w-[1680px] gap-4 md:gap-5">
        <AppSidebar collapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed((value) => !value)} />
        <div
          className={cn(
            "fixed inset-4 z-40 transition lg:hidden",
            isMobileMenuOpen ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-10 opacity-0"
          )}
        >
          <AppSidebar mobile onCloseMobile={() => setIsMobileMenuOpen(false)} />
        </div>
        <main className="min-w-0 flex-1">
          <DashboardHeader
            onToggleMenu={() => setIsMobileMenuOpen((value) => !value)}
            onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
            isSidebarCollapsed={isSidebarCollapsed}
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={`${location.pathname}${location.hash}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <FloatingAIChat getToken={getToken} />
    </div>
  );
}
