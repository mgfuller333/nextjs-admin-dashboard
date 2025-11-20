

// services/charts.services.ts (Revised: Sync readers from store + async fetch fallback)
// New: Sync `getFromStore*` helpers (no fetch, read Zustand directly).
// Async funcs now use `useCache: true` by default (reads store, fetches if missing, updates store).
// For server (home): useCache: false (pure fetch, no store).
// For client: true (cached-first).

import { useSensorStore } from '@/services/store';
import type { SensorKey, SensorPoint } from '@/types/sensor';



const ALLOWED_KEYS = [
  // === BME688 Sensors 0–7 (8 total) ===
  // Sensor 0
  'iaq_0', 'iaqAcc_0', 'co2_0', 'bvoc_0', 'pres_0', 'gasR_0', 'temp_0', 'hum_0', 'com_gas0',
  // Sensor 1
  'iaq_1', 'iaqAcc_1', 'co2_1', 'bvoc_1', 'pres_1', 'gasR_1', 'temp_1', 'hum_1', 'com_gas1',
  // Sensor 2
  'iaq_2', 'iaqAcc_2', 'co2_2', 'bvoc_2', 'pres_2', 'gasR_2', 'temp_2', 'hum_2', 'com_gas2',
  // Sensor 3
  'iaq_3', 'iaqAcc_3', 'co2_3', 'bvoc_3', 'pres_3', 'gasR_3', 'temp_3', 'hum_3', 'com_gas3',
  // Sensor 4
  'iaq_4', 'iaqAcc_4', 'co2_4', 'bvoc_4', 'pres_4', 'gasR_4', 'temp_4', 'hum_4', 'com_gas4',
  // Sensor 5
  'iaq_5', 'iaqAcc_5', 'co2_5', 'bvoc_5', 'pres_5', 'gasR_5', 'temp_5', 'hum_5', 'com_gas5',
  // Sensor 6
  'iaq_6', 'iaqAcc_6', 'co2_6', 'bvoc_6', 'pres_6', 'gasR_6', 'temp_6', 'hum_6', 'com_gas6',
  // Sensor 7
  'iaq_7', 'iaqAcc_7', 'co2_7', 'bvoc_7', 'pres_7', 'gasR_7', 'temp_7', 'hum_7', 'com_gas7',

  // === Power & Battery ===
  'batV', 'batSV', 'batC', 'batP',
  'solV', 'solSV', 'solC', 'solP',

  // === Device Metadata ===
  'device', 'ts', 'bID', 'loc', 'alt', 'satCnt',

  // === Particulate Matter (PM) ===
  'pm10', 'pm2_5', 'pm1',
] as const;

// Helper: Cache key
const getCacheKey = (key: string, timeFrame?: string) => `${key}_${timeFrame || 'default'}`;

// Helper: Validate keys
const validateKeys = (inputKeys: string[]): SensorKey[] => 
  inputKeys.filter(k => ALLOWED_KEYS.includes(k as any)) as SensorKey[];

// Sync reader helpers (client-only, no fetch)
export function getRawDataFromStore(
  timeFrame?: 'monthly' | 'yearly' | string,
  keys: SensorKey[] = ['iaq_2']
): Partial<Record<SensorKey, SensorPoint[]>> {
  const state = useSensorStore.getState();
  const cacheKey = getCacheKey('raw', timeFrame);
  return keys.reduce((acc, key) => {
    acc[key] = state.rawData?.[key] || [];
    return acc;
  }, {} as Partial<Record<SensorKey, SensorPoint[]>>);
}

export function getMonthlyAggregatesFromStore(
  timeFrame: 'monthly' | 'yearly' | string = 'monthly',
  keys: SensorKey[] = ['solV', 'batV', 'co2_2']
): Partial<Record<SensorKey, SensorPoint[]>> {
  const state = useSensorStore.getState();
  const cacheKey = getCacheKey('monthly', timeFrame);
  return keys.reduce((acc, key) => {
    acc[key] = state.monthlyAggregates?.[key] || [];
    return acc;
  }, {} as Partial<Record<SensorKey, SensorPoint[]>>);
}



export function getWeeklyRMSFromStore(
  timeFrame: string = 'last week',
  keys: SensorKey[] = ['iaq_2', 'co2_0']
): { x: string; y: number }[] {
  const state = useSensorStore.getState();
  const cacheKey = getCacheKey('weekly', timeFrame);
  const rmsMap = keys.reduce((acc, key) => {
    acc[key] = state.weeklyRMS?.[key] || 0;
    return acc;
  }, {} as Record<SensorKey, number>);

  return keys
    .map(key => ({
      x: key,
      y: rmsMap[key],
    }))
    .filter(item => item.y > 0) // Skip zeros
    .sort((a, b) => a.x.localeCompare(b.x));
}



// Async funcs (fetch if not cached)
export async function getWeeklyData(
  timeFrame?: 'monthly' | 'yearly' | string,
  keys: string[] = ['iaq_2'],
  useCache: boolean = true // true: check/update store; false: pure fetch
): Promise<Partial<Record<SensorKey, SensorPoint[]>>> {
  const validatedKeys = validateKeys(keys);
  if (validatedKeys.length === 0) return {};

  // Fetch
  //console.log('Fetching raw data');
  const params = new URLSearchParams();
  validatedKeys.forEach(key => params.append('keys', key));

  const res = await fetch(`${process.env.API_BASE_URL}/api/weeklyData?${params.toString()}`);
  if (!res.ok) throw new Error(`API error: ${res.statusText}`);
  const payload = await res.json();


  return validatedKeys.reduce((acc, key) => {
    acc[key] = payload[key as SensorKey] || [];
    return acc;
  }, {} as Partial<Record<SensorKey, SensorPoint[]>>);
}

export async function getOldSensorData(
  timeFrame: 'monthly' | 'yearly' | string = 'monthly',
  keys: string[] = ['solV', 'batV', 'co2_2','batP', 'solP', 'iaq_2'],
  useCache: boolean = true
): Promise<Partial<Record<SensorKey, SensorPoint[]>>> {
  const validatedKeys = validateKeys(keys);
  if (validatedKeys.length === 0) return {};

  const cacheKey = getCacheKey('monthly', timeFrame);

  // Cache check
  if (useCache) {
    const state = useSensorStore.getState();
    const cached = validatedKeys.reduce((acc, key) => {
      acc[key] = state.monthlyAggregates?.[key] || [];
      return acc;
    }, {} as Partial<Record<SensorKey, SensorPoint[]>>);

    if (validatedKeys.every(key => (cached[key]?.length ?? 0) > 0)) {
      console.log('Returning cached monthly');
      return cached;
    }
  }

  // Fetch raw
  const rawData = await getWeeklyData(timeFrame, validatedKeys, useCache);

  //console.log("rawData for monthly aggregation:", rawData);

  // Compute monthly (unchanged)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData: Record<string, number[]> = {};

  validatedKeys.forEach(key => {
    months.forEach(month => {
      monthlyData[`${key}_${month}`] = [];
    });
  });

  validatedKeys.forEach(key => {
    const points = rawData[key] || [];
    points.forEach(p => {
      const date = new Date(p.x);
      const monthName = months[date.getMonth()];
      monthlyData[`${key}_${monthName}`].push(p.y);
    });
  });

  const result: Partial<Record<SensorKey, SensorPoint[]>> = {};
  validatedKeys.forEach(key => {
    result[key] = months.map(month => {
      const values = monthlyData[`${key}_${month}`] || [];
      const avg = values.length > 0
        ? values.reduce((a, b) => a + b, 0) / values.length
        : 0;
      return { x: month, y: Number(avg.toFixed(2)) };
    });
  });

  //console.log('Monthly Aggregated Data:', result);

  // Cache update
  if (useCache) {
    const state = useSensorStore.getState();
    validatedKeys.forEach(key => {
      state.updateMonthlyAggregates(key, result[key] || []);
    });
  }

  return result;
}

export async function getWeeksProfitData(
  timeFrame: string = 'last week',
  keys: string[] = ['iaq_2', 'co2_0','solP', 'batP', 'solV', 'batV','pm2_5']
): Promise<{ x: string; y: number }[]> {
  const validatedKeys = validateKeys(keys);
  if (validatedKeys.length === 0) return [];

  const AQIThreshold = -1; // Low to include all (adjust >0 to skip low-variance)
  const POWER_KEYS = new Set(['solP', 'batP', 'solV', 'batV','iaq_2','co2_0','pm2_5']); // Skip threshold for power (steady data OK)

  // Compute start/end based on timeFrame
  const now = new Date();
  let start: string | undefined;
  let end: string | undefined;
  if (timeFrame === 'last 24 hours') {
    const dayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    start = dayAgo.toISOString();
    end = now.toISOString();
  } else if (timeFrame === 'last week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    start = weekAgo.toISOString();
    end = now.toISOString();
  }
  // Extend for 'last month', etc. (defaults to API fallback if unset)

  // Build params
  const params = new URLSearchParams();
  validatedKeys.forEach(key => params.append('keys', key));
  if (start) params.set('start', start);
  if (end) params.set('end', end);

  // Fetch
  const res = await fetch(`${process.env.API_BASE_URL}/api/data?${params.toString()}`);
  if (!res.ok) {
    console.error('API fetch failed:', res.statusText);
    return [];
  }
  const data = await res.json(); // { iaq_2: [{x: ts, y: val}, ...], ... }
  console.log('Raw results:', data);

  // Compute per-sensor RMS
  const results: { x: string; y: number }[] = [];
  for (const key of validatedKeys) {
    const points = data[key as SensorKey] || []; // Safe access
    if (points.length === 0) continue;

    // Overall RMS for threshold (across all points)
    const sumOfSquares = points.reduce((sum: number, point: SensorPoint) => sum + (point.y * point.y), 0);
    const meanOfSquares = sumOfSquares / points.length;
    const overallRms = Math.sqrt(meanOfSquares);

    // Skip threshold only for non-power (AQI-like)
    if (!POWER_KEYS.has(key) && overallRms <= AQIThreshold) {
      console.log(`Skipping ${key} (RMS ${overallRms.toFixed(3)} ≤ threshold)`);
      continue;
    }

    // Group by day, top 20 max y per day for daily RMS
    const dailyData = new Map<string, number[]>();
    points.forEach((point: SensorPoint) => {
      const date = new Date(point.x);
      const day = date.toISOString().split('T')[0]; // YYYY-MM-DD
      if (!dailyData.has(day)) dailyData.set(day, []);
      dailyData.get(day)!.push(point.y);
    });

    const dailyRmsValues: number[] = [];
    dailyData.forEach((ys) => {
      const top20 = [...ys].sort((a, b) => b - a).slice(0, 20); // Descending, top 20
      if (top20.length === 0) return;
      const sumSq = top20.reduce((s, v) => s + v * v, 0);
      const meanSq = sumSq / top20.length;
      const dayRms = Math.sqrt(meanSq);
      dailyRmsValues.push(Number(dayRms.toFixed(3)));
    });

    if (dailyRmsValues.length === 0) continue;

    // Average daily RMS for this sensor
    const avgRms = dailyRmsValues.reduce((sum, val) => sum + val, 0) / dailyRmsValues.length;

    results.push({
      x: key, // Raw key (component maps to readable)
      y: Number(avgRms.toFixed(3)),
    });
  }

  // Sort by key (alphabetical for chart)
  results.sort((a, b) => a.x.localeCompare(b.x));

  console.log('Computed RMS data:', results);
  return results;
}

// ... (fake funcs like getPaymentsOverviewData unchanged)