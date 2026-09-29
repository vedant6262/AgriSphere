import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import { authMiddleware, requireUser } from "./middleware/auth.js";
import { errorHandler } from "./middleware/error-handler.js";
import routes from "./routes/index.js";

export const createApp = () => {
  const app = express();

  const configuredOrigins = String(env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const isAllowedOrigin = (origin) => {
    if (!origin) {
      return true;
    }

    if (configuredOrigins.includes(origin)) {
      return true;
    }

    return /^https?:\/\/localhost:\d+$/.test(origin) || /^https?:\/\/127\.0\.0\.1:\d+$/.test(origin);
  };

  app.use(
    cors({
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Not allowed by CORS"));
      },
      credentials: true
    })
  );
  app.use(morgan("dev"));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(authMiddleware);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/dashboard", requireUser);
  app.use("/api", routes);
  app.use(errorHandler);

  return app;
};
