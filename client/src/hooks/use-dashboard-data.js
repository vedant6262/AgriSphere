import { useEffect, useState } from "react";
import { dashboardApi } from "@/services/api";

const OVERVIEW_CACHE_TTL_MS = 20 * 1000;
let overviewCache = null;
let overviewCacheAt = 0;
let overviewInFlight = null;

const hasFreshOverviewCache = () => overviewCache && Date.now() - overviewCacheAt < OVERVIEW_CACHE_TTL_MS;

const getLatestSensorSignature = (payload) => {
  const latest = payload?.sensorFeed?.at(-1);

  if (!latest) {
    return null;
  }

  return [latest.timestamp, latest.temperature, latest.humidity, latest.soilMoisture].map((value) => String(value ?? "")).join("|");
};

const fetchOverview = async (getToken, { force = false } = {}) => {
  if (!force && hasFreshOverviewCache()) {
    return overviewCache;
  }

  if (!overviewInFlight) {
    overviewInFlight = dashboardApi
      .getOverview(getToken)
      .then((data) => {
        overviewCache = data;
        overviewCacheAt = Date.now();
        return data;
      })
      .finally(() => {
        overviewInFlight = null;
      });
  }

  return overviewInFlight;
};

export function useDashboardData(getToken, options = {}) {
  const { refreshIntervalMs = 0, forceRefresh = false, updateOnSensorChange = false } = options;
  const [state, setState] = useState({
    data: hasFreshOverviewCache() ? overviewCache : null,
    isLoading: !hasFreshOverviewCache(),
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    fetchOverview(getToken, { force: forceRefresh })
      .then((data) => {
        if (isMounted) {
          setState({ data, isLoading: false, error: null });
        }
      })
      .catch((error) => {
        if (isMounted) {
          setState({
            data: null,
            isLoading: false,
            error: error.response?.data?.message || error.message
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [getToken, forceRefresh]);

  useEffect(() => {
    if (!refreshIntervalMs) {
      return undefined;
    }

    let isMounted = true;
    const interval = setInterval(() => {
      fetchOverview(getToken, { force: true })
        .then((data) => {
          if (isMounted) {
            setState((prev) => {
              if (updateOnSensorChange) {
                const prevSignature = getLatestSensorSignature(prev.data);
                const nextSignature = getLatestSensorSignature(data);

                if (prevSignature && nextSignature && prevSignature === nextSignature) {
                  return { ...prev, isLoading: false, error: null };
                }
              }

              return { ...prev, data, isLoading: false, error: null };
            });
          }
        })
        .catch((error) => {
          if (isMounted) {
            setState((prev) => ({
              ...prev,
              isLoading: false,
              error: error.response?.data?.message || error.message
            }));
          }
        });
    }, refreshIntervalMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [getToken, refreshIntervalMs, updateOnSensorChange]);

  return state;
}
