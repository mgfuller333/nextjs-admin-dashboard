

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
export async function getRawData(
  inputkeys: string[] = ['solV', 'batV', 'pm2_5', 'iaq_2'],
): Promise<Partial<Record<SensorKey, SensorPoint[]>>> {
  const validatedKeys = validateKeys(inputkeys);
  if (validatedKeys.length === 0) return {};

  // Fetch
  //console.log('Fetching raw data');
  const params = new URLSearchParams();
  validatedKeys.forEach(key => params.append('keys', key));

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/rawData`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ keys: inputkeys })
});

//  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/weeklyData?${params.toString()}`);
  if (!res.ok) throw new Error(`API error: ${res.statusText}`);
  const payload = await res.json();



  return validatedKeys.reduce((acc, key) => {
    acc[key] = payload[key as SensorKey] || [];
    return acc;
  }, {} as Partial<Record<SensorKey, SensorPoint[]>>);
}


