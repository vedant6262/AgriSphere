import { clerkMiddleware, getAuth } from "@clerk/express";
import { env } from "../config/env.js";

const noop = (_req, _res, next) => next();

export const authMiddleware = env.CLERK_SECRET_KEY ? clerkMiddleware() : noop;

export const resolveUserId = (req) => {
  const requestAuth = typeof req.auth === "function" ? req.auth() : req.auth;

  if (requestAuth?.userId) {
    return requestAuth.userId;
  }

  if (env.CLERK_SECRET_KEY) {
    const auth = getAuth(req);
    if (auth?.userId) {
      return auth.userId;
    }
  }

  if (env.ALLOW_DEMO_MODE) {
    return "demo-user";
  }

  return null;
};

export const requireUser = (req, res, next) => {
  const userId = resolveUserId(req);

  if (!userId) {
    return res.status(401).json({ message: "Authentication required." });
  }

  req.userId = userId;
  next();
};
