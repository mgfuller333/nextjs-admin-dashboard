// stores/sensorStore.ts (Client-side only—import in 'use client' components)
// npm i zustand if not already (tiny ~3kB, no build config needed in Next.js)

import { create } from 'zustand';

// Your ALLOWED_KEYS (ensures type safety)
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

// Types
type SensorKey = typeof ALLOWED_KEYS[number];
type SensorPoint = { x: string; y: number }; // x: ISO ts or label (e.g., 'Jan'), y: value or avg/RMS
type RawData = { [K in SensorKey]?: SensorPoint[] };
type MonthlyAggregates = { [K in SensorKey]?: SensorPoint[] }; // Monthly {x: 'Jan', y: avg}
type WeeklyRMS = { [K in SensorKey]?: number }; // Per-key avg RMS

// Initial state
const initialRawData: RawData = ALLOWED_KEYS.reduce((acc, key) => { acc[key] = []; return acc; }, {} as RawData);
const initialMonthly: MonthlyAggregates = ALLOWED_KEYS.reduce((acc, key) => { acc[key] = []; return acc; }, {} as MonthlyAggregates);
const initialWeeklyRMS: WeeklyRMS = ALLOWED_KEYS.reduce((acc, key) => { acc[key] = 0; return acc; }, {} as WeeklyRMS);

interface SensorStore {
  rawData: RawData;
  monthlyAggregates: MonthlyAggregates;
  weeklyRMS: WeeklyRMS;

  // Actions for raw data (existing)
  updateRawData: (key: SensorKey, data: SensorPoint[]) => void;
  appendRawData: (key: SensorKey, point: SensorPoint) => void;
  clearRawData: (key: SensorKey) => void;
  clearAllRawData: () => void;

  // New: Monthly aggregates
  setMonthlyAggregates: (data: MonthlyAggregates) => void;
  updateMonthlyAggregates: (key: SensorKey, data: SensorPoint[]) => void;
  clearMonthlyAggregates: (key: SensorKey) => void;
  clearAllMonthlyAggregates: () => void;

  // New: Weekly RMS
  updateWeeklyRMS: (key: SensorKey, rms: number) => void;
  clearWeeklyRMS: (key: SensorKey) => void;
  clearAllWeeklyRMS: () => void;
}

export const useSensorStore = create<SensorStore>((set) => ({
  rawData: initialRawData,
  monthlyAggregates: initialMonthly,
  weeklyRMS: initialWeeklyRMS,

  // Raw data actions (renamed for clarity)
  updateRawData: (key, data) => set((state) => ({ rawData: { ...state.rawData, [key]: data } })),
  appendRawData: (key, point) => set((state) => ({
    rawData: {
      ...state.rawData,
      [key]: [...(state.rawData[key] || []), point],
    },
  })),
  clearRawData: (key) => set((state) => ({ rawData: { ...state.rawData, [key]: [] } })),
  clearAllRawData: () => set({ rawData: initialRawData }),

  // Monthly actions
 setMonthlyAggregates: (data) =>
    set({
      monthlyAggregates: data, // Full replace — exactly what you want!
    }),
  updateMonthlyAggregates: (key: SensorKey, data: SensorPoint[]) => set((state) => ({ monthlyAggregates: { ...state.monthlyAggregates, [key]: data } })),
  clearMonthlyAggregates: (key) => set((state) => ({ monthlyAggregates: { ...state.monthlyAggregates, [key]: [] } })),
  clearAllMonthlyAggregates: () => set({ monthlyAggregates: initialMonthly }),

  // Weekly RMS actions
  updateWeeklyRMS: (key, rms) => set((state) => ({ weeklyRMS: { ...state.weeklyRMS, [key]: rms } })),
  clearWeeklyRMS: (key) => set((state) => ({ weeklyRMS: { ...state.weeklyRMS, [key]: 0 } })),
  clearAllWeeklyRMS: () => set({ weeklyRMS: initialWeeklyRMS }),
}));