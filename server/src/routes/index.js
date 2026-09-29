import express from "express";
import alertsRoutes from "./alerts.routes.js";
import communityRoutes from "./community.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import expensesRoutes from "./expenses.routes.js";
import farmCalendarRoutes from "./farm-calendar.routes.js";
import governmentSchemesRoutes from "./government-schemes.routes.js";
import settingsRoutes from "./settings.routes.js";

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "AgriSphere API"
  });
});

router.use("/dashboard", dashboardRoutes);
router.use("/community", communityRoutes);
router.use("/expenses", expensesRoutes);
router.use("/settings", settingsRoutes);
router.use("/alerts", alertsRoutes);
router.use("/farm-calendar", farmCalendarRoutes);
router.use("/government-schemes", governmentSchemesRoutes);

export default router;
