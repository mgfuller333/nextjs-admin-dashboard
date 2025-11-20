// components/SensorDashboard.tsx
'use client';

import { useEffect, useMemo } from 'react';
import { useSensorStore } from '@/services/store';
import { getOldSensorData, getWeeksProfitData } from '@/services/charts.services';
import type { SensorKey, SensorPoint } from '@/types/sensor';

interface Props {
  monthlyData?: Partial<Record<SensorKey, SensorPoint[]>>;
  weeklyRMS?: Partial<Record<SensorKey, number>>;
  keys?: SensorKey[];
}

export function SensorDashboard({
  monthlyData = {},
  weeklyRMS = {},
  keys = [],
}: Props) {
  const {
    monthlyAggregates,
    weeklyRMS: storeWeeklyRMS,
    updateMonthlyAggregates,
    updateWeeklyRMS,
    clearAllMonthlyAggregates,
    clearAllWeeklyRMS,
  } = useSensorStore();

  // ─────────────────────────────────────────────────────────────
  // ALL HOOKS FIRST — ALWAYS called, no matter what
  // ─────────────────────────────────────────────────────────────
  const hasKeys = keys.length > 0;

  const isMonthlyCached = useMemo(() => {
    if (!hasKeys) return false;
    return keys.every(key => monthlyAggregates?.[key]?.length ?? 0 > 0);
  }, [hasKeys, keys, monthlyAggregates]);

  const isWeeklyCached = useMemo(() => {
    if (!hasKeys) return false;
    return keys.every(key => storeWeeklyRMS?.[key] != null);
  }, [hasKeys, keys, storeWeeklyRMS]);

  // Monthly hydration
  useEffect(() => {
    if (!hasKeys) return;

    if (monthlyData && Object.keys(monthlyData).length > 0) {
      keys.forEach(key => {
        if (monthlyData[key]?.length) {
          updateMonthlyAggregates(key, monthlyData[key]!);
        }
      });
      return;
    }

    if (!isMonthlyCached) {
      getOldSensorData('monthly', keys)
        .then(payload => {
          keys.forEach(key => {
            if (payload[key]?.length) {
              updateMonthlyAggregates(key, payload[key]!);
            }
          });
        })
        .catch(err => console.error('Monthly fetch failed:', err));
    }
  }, [hasKeys, keys, monthlyData, isMonthlyCached, updateMonthlyAggregates]);

  // Weekly RMS hydration
  useEffect(() => {
    if (!hasKeys) return;

    if (weeklyRMS && Object.keys(weeklyRMS).length > 0) {
      keys.forEach(key => {
        if (typeof weeklyRMS[key] === 'number') {
          updateWeeklyRMS(key, weeklyRMS[key]!);
        }
      });
      return;
    }

    if (!isWeeklyCached) {
      getWeeksProfitData('last week', keys)
        .then(payload => {
          payload.forEach(({ x: keyStr, y: rms }) => {
            const key = keyStr as SensorKey;
            if (keys.includes(key)) {
              updateWeeklyRMS(key, rms);
            }
          });
        })
        .catch(err => console.error('Weekly RMS fetch failed:', err));
    }
  }, [hasKeys, keys, weeklyRMS, isWeeklyCached, updateWeeklyRMS]);

  // ─────────────────────────────────────────────────────────────
  // Early return AFTER all hooks
  // ─────────────────────────────────────────────────────────────
  if (!hasKeys) {
    return (
      <div className="col-span-12 mt-6 p-8 text-center">
        <p className="text-lg text-muted-foreground">No sensors selected</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Render main UI
  // ─────────────────────────────────────────────────────────────
  const handleClear = () => {
    clearAllMonthlyAggregates();
    clearAllWeeklyRMS();
  };

  return (
    <div className="col-span-12 mt-6 space-y-6 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-dark">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-dark dark:text-white">
          Sensor Data ({keys.length} selected)
        </h3>
        <button
          onClick={handleClear}
          className="rounded px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Clear Cache
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {keys.map(key => {
          const points = monthlyAggregates?.[key] || [];
          const rms = storeWeeklyRMS?.[key];

          return (
            <div
              key={key}
              className="rounded-lg border bg-card p-5 shadow-sm dark:border-gray-700"
            >
              <h4 className="mb-3 font-semibold text-dark dark:text-white">
                {key}
              </h4>

              {points.length > 0 ? (
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Latest:</span>{' '}
                    <strong>{points[points.length - 1].y.toFixed(2)}</strong>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Points:</span>{' '}
                    {points.length}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Loading data...</p>
              )}

              <p className="mt-3 text-sm">
                <span className="text-muted-foreground">Weekly RMS:</span>{' '}
                <strong>{rms != null ? rms.toFixed(3) : '—'}</strong>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}