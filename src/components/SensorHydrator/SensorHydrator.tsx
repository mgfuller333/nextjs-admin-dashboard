// components/SensorHydrator.tsx ('use client'—logs hydration, ensures push)
'use client';

import { useEffect } from 'react';
import { useSensorStore } from '@/services/store';
import type { SensorKey, SensorPoint } from '@/types/sensor';

interface Props {
  rawData: Partial<Record<SensorKey, SensorPoint[]>>;
  monthlyData: Partial<Record<SensorKey, SensorPoint[]>>;
  weeklyRMS: Partial<Record<SensorKey, number>>;
  keys: SensorKey[];
}

export function SensorHydrator({ rawData, monthlyData, weeklyRMS, keys }: Props) {
  const { updateRawData, updateMonthlyAggregates, updateWeeklyRMS } = useSensorStore();

  useEffect(() => {
    console.log('Hydrator starting—props keys:', keys.length);
    console.log('Hydrator weeklyRMS prop:', weeklyRMS); // Check if server computed non-empty

    keys.forEach(key => {
      if (rawData[key]) {
        updateRawData(key, rawData[key]);
        console.log(`Pushed raw for ${key}: ${rawData[key].length} points`);
      }
      if (monthlyData[key]) {
        updateMonthlyAggregates(key, monthlyData[key]);
        console.log(`Pushed monthly for ${key}: ${monthlyData[key].length} points`);
      }
      if (typeof weeklyRMS[key] === 'number') {
        updateWeeklyRMS(key, weeklyRMS[key]);
        console.log(`Pushed weekly RMS for ${key}: ${weeklyRMS[key]}`);
      }
    });

    // Log final state (verify push)
    setTimeout(() => {
      console.log('Hydrator post-push state.weeklyRMS:', useSensorStore.getState().weeklyRMS);
    }, 0); // Next tick for updates
  }, [keys, rawData, monthlyData, weeklyRMS, updateRawData, updateMonthlyAggregates, updateWeeklyRMS]);

  return <div className="hidden">Hydrator (invisible)</div>; // Visible for testing—remove 'hidden' class
}