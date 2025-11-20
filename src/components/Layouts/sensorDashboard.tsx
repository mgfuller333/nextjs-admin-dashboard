// components/SensorDashboard.tsx ('use client'—TS-fixed partials + guards)
'use client';

import { useEffect, useMemo } from 'react';
import { useSensorStore } from '@/services/store';
import { getOldSensorData, getWeeksProfitData } from '@/services/charts.services';
import type { SensorKey, SensorPoint } from '@/types/sensor';

interface Props {
  monthlyData?: Partial<Record<SensorKey, SensorPoint[]>>; // Partial: Matches sparse server data
  weeklyRMS?: Partial<Record<SensorKey, number>>; // Partial for RMS map
  keys?: SensorKey[]; // Guarded below
}

// No defaultProps needed—use inline defaults + guards
export function SensorDashboard({
  monthlyData = {}, // Empty {} is fine for Partial (TS allows missing keys)
  weeklyRMS = {}, // Same
  keys = [], // Fallback array
}: Props) {
  const {
    monthlyAggregates,
    weeklyRMS: storeWeeklyRMS,
    updateMonthlyAggregates,
    updateWeeklyRMS,
    clearAllMonthlyAggregates,
    clearAllWeeklyRMS,
  } = useSensorStore();

  // Guard: Early return if no keys (prevents .every on undefined/empty)
  if (!keys || keys.length === 0) {
    console.warn('SensorDashboard: No keys—skipping render');
    return null; // Or placeholder UI: <div>Select sensors...</div>
  }

  // Memo: Safe with ?? (guards against undefined monthlyAggregates)
  const isMonthlyCached = useMemo(
    () => keys.every(key => (monthlyAggregates?.[key]?.length ?? 0) > 0),
    [keys, monthlyAggregates]
  );
  const isWeeklyCached = useMemo(
    () => keys.every(key => (storeWeeklyRMS?.[key] ?? 0) > 0),
    [keys, storeWeeklyRMS]
  );

  // Hydrate monthly: Props first (partial-safe), then fetch if missing
  useEffect(() => {
    // Hydrate from partial props (server data—no fetch)
    if (monthlyData && Object.keys(monthlyData).length > 0) {
      console.log('Hydrating monthly from partial server props');
      keys.forEach(key => {
        if (monthlyData[key]) { // Safe: Partial may omit keys
          updateMonthlyAggregates(key, monthlyData[key]);
        }
      });
      return; // Props win—skip fetch
    }

    // Client fallback if not cached
    if (!isMonthlyCached) {
      console.log('Fetching monthly (not cached/props)');
      getOldSensorData('monthly', keys).then(payload => {
        keys.forEach(key => {
          if (payload[key]) updateMonthlyAggregates(key, payload[key]);
        });
      }).catch(err => console.error('Monthly error:', err));
    } else {
      console.log('Using cached monthly');
    }
  }, [keys, isMonthlyCached, monthlyData, updateMonthlyAggregates]); // monthlyData dep for prop changes

  // Hydrate weekly: Similar partial handling
  useEffect(() => {
    if (weeklyRMS && Object.keys(weeklyRMS).length > 0) {
      console.log('Hydrating weekly RMS from partial server props');
      keys.forEach(key => {
        if (typeof weeklyRMS[key] === 'number') {
          updateWeeklyRMS(key, weeklyRMS[key]);
        }
      });
      return;
    }

    if (!isWeeklyCached) {
      console.log('Fetching weekly RMS (not cached/props)');
      getWeeksProfitData('last week', keys).then(payload => {
        payload.forEach(({ x: keyStr, y: rms }) => {
          const key = keyStr as SensorKey;
          if (keys.includes(key)) updateWeeklyRMS(key, rms);
        });
      }).catch(err => console.error('Weekly RMS error:', err));
    } else {
      console.log('Using cached weekly RMS');
    }
  }, [keys, isWeeklyCached, weeklyRMS, updateWeeklyRMS]);

  // Render: Safe access with ?./?? (no crashes on partials)
  const renderForKey = (key: SensorKey) => {
    const data = monthlyAggregates?.[key] || [];
    return (
      <div key={key} className="mb-4 p-2 border rounded">
        <h4 className="font-bold">{key}</h4>
        <ul>
          {data.map((point, idx) => (
            <li key={idx}>{point.x}: {point.y.toFixed(2)}</li>
          ))}
        </ul>
        <p>Weekly RMS: {storeWeeklyRMS?.[key]?.toFixed(3) ?? 'N/A'}</p>
      </div>
    );
  };

  const handleClear = () => {
    clearAllMonthlyAggregates();
    clearAllWeeklyRMS();
  };

//   return (
//     <div className="col-span-12 mt-4 p-4 border rounded bg-gray-50">
//       <h3 className="mb-2 text-lg font-semibold">Sensors (Partial/Cached)</h3>
//       {keys.map(renderForKey)}
//       <button
//         onClick={handleClear}
//         className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//       >
//         Clear Cache
//       </button>
//     </div>
//   );
}