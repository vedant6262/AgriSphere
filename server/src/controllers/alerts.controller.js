import { acknowledgeAlert, listAlerts } from "../services/alerts.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const getAlerts = asyncHandler(async (req, res) => {
  const alerts = await listAlerts(req.userId);
  res.json({ alerts });
});

const writeSse = (res, event, data) => {
  if (event) {
    res.write(`event: ${event}\n`);
  }

  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

export const streamAlerts = (req, res) => {
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  let closed = false;
  let lastSignature = "";
  let inFlight = false;

  const pushSnapshot = async () => {
    if (closed || inFlight) {
      return;
    }

    inFlight = true;

    try {
      const alerts = await listAlerts(req.userId);
      const signature = alerts.map((alert) => `${alert.id}:${alert.acknowledged}:${alert.issuedAt}`).join("|");

      if (signature !== lastSignature) {
        lastSignature = signature;
        writeSse(res, "alerts", { alerts });
      }
    } catch (error) {
      if (!closed) {
        writeSse(res, "error", { message: "Unable to refresh alerts." });
        console.warn("[alerts] live stream refresh failed", error.message);
      }
    } finally {
      inFlight = false;
    }
  };

  writeSse(res, "ready", { ok: true });
  pushSnapshot();

  const timer = setInterval(() => {
    if (closed) {
      return;
    }

    res.write(": heartbeat\n\n");
    pushSnapshot();
  }, 15000);

  req.on("close", () => {
    closed = true;
    clearInterval(timer);
    res.end();
  });
};

export const acknowledge = asyncHandler(async (req, res) => {
  const alert = await acknowledgeAlert(req.userId, req.params.id);
  res.json({ alert });
});
