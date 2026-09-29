import { useEffect, useRef } from "react";
import { alertsApi } from "@/services/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseSseBlock = (block) => {
  const lines = block.split("\n");
  let eventName = "message";
  const dataLines = [];

  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
      continue;
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  return {
    eventName,
    data: dataLines.join("\n")
  };
};

export function useAlertsStream(getToken, onAlerts, enabled = true) {
  const onAlertsRef = useRef(onAlerts);

  useEffect(() => {
    onAlertsRef.current = onAlerts;
  }, [onAlerts]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let cancelled = false;
    let abortController = null;
    let pollTimer = null;

    const pollAlerts = async () => {
      try {
        const response = await alertsApi.list(getToken);
        if (!cancelled) {
          onAlertsRef.current?.(Array.isArray(response.alerts) ? response.alerts : []);
        }
      } catch {
        // Stream will keep trying; a poll failure should not break the UI.
      }
    };

    pollAlerts();
    pollTimer = setInterval(pollAlerts, 15000);

    const connect = async () => {
      while (!cancelled) {
        try {
          const token = getToken ? await getToken() : null;
          abortController = new AbortController();
          const response = await fetch(`${API_BASE_URL}/alerts/stream`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            signal: abortController.signal
          });

          if (!response.ok || !response.body) {
            throw new Error(`Alert stream failed with status ${response.status}`);
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (!cancelled) {
            const { value, done } = await reader.read();

            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });

            let separatorIndex = buffer.indexOf("\n\n");
            while (separatorIndex !== -1) {
              const block = buffer.slice(0, separatorIndex).trim();
              buffer = buffer.slice(separatorIndex + 2);

              if (block) {
                const { eventName, data } = parseSseBlock(block);

                if (eventName === "alerts" || eventName === "message") {
                  try {
                    const parsed = data ? JSON.parse(data) : {};
                    const nextAlerts = Array.isArray(parsed.alerts) ? parsed.alerts : [];
                    onAlertsRef.current?.(nextAlerts);
                  } catch {
                    onAlertsRef.current?.([]);
                  }
                }
              }

              separatorIndex = buffer.indexOf("\n\n");
            }
          }
        } catch {
          if (cancelled) {
            return;
          }

          await wait(5000);
        } finally {
          abortController?.abort();
          abortController = null;
        }
      }
    };

    connect();

    return () => {
      cancelled = true;
      abortController?.abort();
      if (pollTimer) {
        clearInterval(pollTimer);
      }
    };
  }, [enabled, getToken]);
}