import { getPrisma } from "../lib/prisma.js";
import { fallbackAlerts } from "../utils/fallback-data.js";
import { listTasks } from "./farm-calendar.service.js";
import { getFarmSettings } from "./settings.service.js";
import { getSensorFeed } from "./thingspeak.service.js";
import { getWeatherForecast } from "./weather.service.js";

const demoAlertsByUser = new Map();

const getDemoAlerts = (clerkUserId) => demoAlertsByUser.get(clerkUserId) || [];

const setDemoAlerts = (clerkUserId, alerts) => {
  demoAlertsByUser.set(clerkUserId, alerts);
  return alerts;
};

const createDemoAlertIfMissing = (clerkUserId, payload) => {
  const existingAlerts = getDemoAlerts(clerkUserId);

  if (payload.uniqueKey) {
    const existingByKey = existingAlerts.find((alert) => alert.description.includes(payload.uniqueKey));

    if (existingByKey) {
      return existingByKey;
    }
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const existing = existingAlerts.find((alert) => alert.title === payload.title && new Date(alert.issuedAt) >= todayStart);

  if (existing) {
    return existing;
  }

  const alert = {
    id: `demo-alert-${Date.now()}`,
    farmProfileId: "demo-settings",
    type: payload.type,
    severity: payload.severity,
    title: payload.title,
    description: payload.description,
    issuedAt: new Date().toISOString(),
    acknowledged: false
  };

  setDemoAlerts(clerkUserId, [alert, ...existingAlerts]);
  return alert;
};

const createAlertIfMissing = async (prisma, clerkUserId, profileId, payload) => {
  if (!prisma || profileId === "demo-settings") {
    return createDemoAlertIfMissing(clerkUserId, payload);
  }

  if (payload.uniqueKey) {
    const existingByKey = await prisma.alert.findFirst({
      where: {
        farmProfileId: profileId,
        description: {
          contains: payload.uniqueKey
        }
      }
    });

    if (existingByKey) {
      return existingByKey;
    }
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const existing = await prisma.alert.findFirst({
    where: {
      farmProfileId: profileId,
      title: payload.title,
      issuedAt: {
        gte: todayStart
      }
    }
  });

  if (existing) {
    return existing;
  }

  return prisma.alert.create({
    data: {
      farmProfileId: profileId,
      type: payload.type,
      severity: payload.severity,
      title: payload.title,
      description: payload.description
    }
  });
};

export const recordTaskAlert = async (clerkUserId, task) => {
  const scheduledAt = new Date(task.scheduledAt);
  if (!Number.isFinite(scheduledAt.getTime()) || scheduledAt > new Date()) {
    return null;
  }

  const prisma = await getPrisma();
  const settings = await getFarmSettings(clerkUserId);
  const profileId = settings.id;
  const taskDate = scheduledAt.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  return createAlertIfMissing(prisma, clerkUserId, profileId, {
    type: "CLIMATE",
    severity: "MEDIUM",
    title: `Task scheduled now: ${task.title}`,
    description: `Task ID:${task.id} Scheduled for ${taskDate}. ${task.description || "Open farm calendar for full details."}`,
    uniqueKey: `Task ID:${task.id}`
  });
};

const generateSmartAlerts = async (clerkUserId) => {
  const prisma = await getPrisma();

  try {
    const settings = await getFarmSettings(clerkUserId);
    const profileId = settings.id;

    const [weatherResult, sensorFeedResult, tasksResult] = await Promise.allSettled([
      getWeatherForecast(settings),
      getSensorFeed(settings),
      listTasks(clerkUserId)
    ]);

    const weather = weatherResult.status === "fulfilled" ? weatherResult.value : null;
    const sensorFeed = sensorFeedResult.status === "fulfilled" ? sensorFeedResult.value : [];
    const tasks = tasksResult.status === "fulfilled" ? tasksResult.value : [];

  const currentTemp = weather?.current?.temperature;
  const latestSensorTemp = sensorFeed.at(-1)?.temperature;
  const previousSensorTemp = sensorFeed.at(-2)?.temperature;
  const effectiveTemp = Number.isFinite(latestSensorTemp) ? latestSensorTemp : currentTemp;
  const lowThreshold = settings.tempLowThreshold ?? 18;
  const highThreshold = settings.tempHighThreshold ?? 35;
  const location = weather?.location || settings.location || "your farm";

  if (Number.isFinite(effectiveTemp) && effectiveTemp >= highThreshold) {
    await createAlertIfMissing(prisma, clerkUserId, profileId, {
      type: "WEATHER",
      severity: "HIGH",
      title: "High temperature alert",
      description: `Temperature at ${location} reached ${effectiveTemp}C, above your threshold of ${highThreshold}C. Consider irrigation and heat protection today.`
    });
  }

  if (Number.isFinite(effectiveTemp) && effectiveTemp <= lowThreshold) {
    await createAlertIfMissing(prisma, clerkUserId, profileId, {
      type: "WEATHER",
      severity: "MEDIUM",
      title: "Low temperature alert",
      description: `Temperature at ${location} dropped to ${effectiveTemp}C, below your threshold of ${lowThreshold}C. Plan crop protection for cold stress.`
    });
  }

  if (Number.isFinite(latestSensorTemp) && Number.isFinite(previousSensorTemp)) {
    const delta = Number((latestSensorTemp - previousSensorTemp).toFixed(1));

    if (delta >= 3) {
      await createAlertIfMissing(prisma, clerkUserId, profileId, {
        type: "CLIMATE",
        severity: "HIGH",
        title: "Temperature rise detected",
        description: `IoT sensor temperature increased by ${delta}C since last reading at ${location}. Consider irrigation and canopy cooling actions.`
      });
    }

    if (delta <= -3) {
      await createAlertIfMissing(prisma, clerkUserId, profileId, {
        type: "CLIMATE",
        severity: "MEDIUM",
        title: "Temperature drop detected",
        description: `IoT sensor temperature dropped by ${Math.abs(delta)}C since last reading at ${location}. Review crop protection schedule.`
      });
    }
  }

    const now = new Date();
    for (const task of tasks) {
      const taskTime = new Date(task.scheduledAt);
      if (taskTime > now) {
        continue;
      }

      const taskDate = taskTime.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      });

      await createAlertIfMissing(prisma, clerkUserId, profileId, {
        type: "CLIMATE",
        severity: "MEDIUM",
        title: `Task scheduled now: ${task.title}`,
        description: `Task ID:${task.id} Scheduled for ${taskDate}. ${task.description || "Open farm calendar for full details."}`,
        uniqueKey: `Task ID:${task.id}`
      });
    }
  } catch (error) {
    console.warn("[alerts] smart alert generation failed", error.message);
  }
};

export const listAlerts = async (clerkUserId) => {
  const prisma = await getPrisma();

  if (!prisma) {
    return [...getDemoAlerts(clerkUserId), ...fallbackAlerts];
  }

  try {
    await generateSmartAlerts(clerkUserId);

    const profile = await getFarmSettings(clerkUserId);

    if (profile.id === "demo-settings") {
      return [...getDemoAlerts(clerkUserId), ...fallbackAlerts];
    }

    const alerts = await prisma.alert.findMany({
      where: {
        OR: [
          { farmProfileId: null },
          { farmProfileId: profile.id }
        ]
      },
      orderBy: { issuedAt: "desc" }
    });

    return [...getDemoAlerts(clerkUserId), ...alerts, ...fallbackAlerts];
  } catch (error) {
    console.warn("[alerts] prisma error, using fallback", error.message);
    return [...getDemoAlerts(clerkUserId), ...fallbackAlerts];
  }
};

export const acknowledgeAlert = async (_clerkUserId, alertId) => {
  const prisma = await getPrisma();

  if (String(alertId || "").startsWith("demo-alert-")) {
    const alerts = getDemoAlerts(_clerkUserId);
    const target = alerts.find((alert) => alert.id === alertId) || null;

    if (!target) {
      return null;
    }

    const updated = alerts.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert));
    setDemoAlerts(_clerkUserId, updated);
    return { ...target, acknowledged: true };
  }

  if (!prisma) {
    return fallbackAlerts.find((alert) => alert.id === alertId) || fallbackAlerts[0];
  }

  try {
    return prisma.alert.update({
      where: { id: alertId },
      data: { acknowledged: true }
    });
  } catch (error) {
    console.warn("[alerts] prisma error, using fallback", error.message);
    return fallbackAlerts.find((alert) => alert.id === alertId) || fallbackAlerts[0];
  }
};
