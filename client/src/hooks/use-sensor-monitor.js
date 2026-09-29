import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { dashboardApi } from "@/services/api";
import { SENSOR_EMPTY_READING } from "@/components/monitoring/sensor-monitor.constants";
import { normalizeSensorReading, parseSerialLine } from "@/components/monitoring/sensor-monitor.parser";

const DEFAULT_POLL_MS = 15000;
const DEFAULT_MAX_POINTS = 20;

function appendReading(existing, reading, maxPoints) {
  return [...existing, reading].slice(-maxPoints);
}

export function useSensorMonitor({
  getToken,
  pollingMs = DEFAULT_POLL_MS,
  maxPoints = DEFAULT_MAX_POINTS,
  source = "api"
} = {}) {
  const [feed, setFeed] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [serialError, setSerialError] = useState(null);
  const readerRef = useRef(null);
  const portRef = useRef(null);
  const serialBufferRef = useRef("");
  const serialReadingRef = useRef(null);

  const pushReading = useCallback(
    (reading) => {
      setFeed((prev) => appendReading(prev, normalizeSensorReading(reading), maxPoints));
    },
    [maxPoints]
  );

  useEffect(() => {
    if (source !== "api") {
      return;
    }

    let alive = true;

    const pull = async () => {
      const response = await dashboardApi.getSensors(getToken);
      const next = (response.sensorFeed || []).map(normalizeSensorReading).slice(-maxPoints);
      if (alive) {
        setFeed(next);
      }
    };

    pull().catch(() => {});
    const timer = setInterval(() => {
      pull().catch(() => {});
    }, pollingMs);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [getToken, maxPoints, pollingMs, source]);

  const disconnectSerial = useCallback(async () => {
    try {
      await readerRef.current?.cancel();
    } catch {
      // The device may already be disconnected.
    }

    try {
      await portRef.current?.close();
    } catch {
      // The port may already be closed.
    }

    readerRef.current = null;
    portRef.current = null;
    serialBufferRef.current = "";
    serialReadingRef.current = null;
  }, []);

  const connectSerial = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.serial) {
      setSerialError("Web Serial API is not available in this browser. Use Chrome or Edge.");
      return;
    }

    if (isConnecting || portRef.current) {
      return;
    }

    setIsConnecting(true);
    setSerialError(null);

    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      portRef.current = port;

      const decoder = new TextDecoderStream();
      port.readable.pipeTo(decoder.writable);
      const reader = decoder.readable.getReader();
      readerRef.current = reader;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        serialBufferRef.current += String(value || "");
        const chunks = serialBufferRef.current.split(/\r?\n/);
        const hasCompleteLine = /\r?\n$/.test(serialBufferRef.current);
        serialBufferRef.current = hasCompleteLine ? "" : chunks.pop() || "";
        const lines = chunks.map((line) => line.trim()).filter(Boolean);

        for (const line of lines) {
          const parsed = parseSerialLine(line);
          if (parsed) {
            const fields = parsed.serialFields || ["soilMoisture", "humidity", "temperature"];
            const mergedReading = {
              ...serialReadingRef.current,
              ...Object.fromEntries(fields.map((field) => [field, parsed[field]])),
              timestamp: parsed.timestamp
            };
            serialReadingRef.current = mergedReading;
            pushReading(mergedReading);
          }
        }
      }
    } catch (error) {
      await disconnectSerial();
      const message = String(error?.message || "");
      setSerialError(
        /failed to open serial port|already open|access is denied|busy/i.test(message)
          ? "Unable to open this Arduino port. Close Arduino Serial Monitor and Serial Plotter, then try again."
          : message || "Unable to connect to the Arduino serial port."
      );
    } finally {
      setIsConnecting(false);
    }
  }, [disconnectSerial, isConnecting, pushReading]);

  useEffect(() => {
    return () => {
      disconnectSerial().catch(() => {});
    };
  }, [disconnectSerial]);

  const latest = feed.at(-1) || SENSOR_EMPTY_READING;
  const previous = feed.at(-2) || null;

  return useMemo(
    () => ({
      feed,
      latest,
      previous,
      isConnecting,
      serialError,
      connectSerial,
      disconnectSerial,
      pushReading
    }),
    [connectSerial, disconnectSerial, feed, isConnecting, latest, previous, pushReading, serialError]
  );
}