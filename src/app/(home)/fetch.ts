// utils/getOverviewData.ts
import { format, parseISO } from 'date-fns';

// ──────────────────────
// Reusable Helpers (kept exactly as you had them)
// ──────────────────────

export function formattedLastSeen(isoString: string): [number, string] {
  try {
    const date = parseISO(isoString);
    if (isNaN(date.getTime())) return [0, 'Unknown'];

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return [0, 'Future'];

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return [diffSeconds, 's'];
    if (diffMinutes < 60) return [diffMinutes, 'm'];
    if (diffHours < 24) return [diffHours, 'h'];
    return [diffDays, 'd'];
  } catch (error) {
    console.error('formattedLastSeen error:', error);
    return [0, 'Unknown'];
  }
}

export function isOnlineStatus(isoString: string): string {
  try {
    const date = parseISO(isoString);
    if (isNaN(date.getTime())) return 'Offline';

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return date > oneHourAgo ? 'Online' : 'Offline';
  } catch (error) {
    console.error('isOnlineStatus error:', error);
    return 'Offline';
  }
}

// ──────────────────────
// Quarterly Growth: latest reading vs avg of last 13 weeks
// ──────────────────────

function calculateQuarterlyGrowth(
  weeklyData: { x: string; y: number }[] | undefined,
  latestValue: number,
  weeks: number = 13
): number {
  if (!weeklyData || weeklyData.length === 0 || latestValue === undefined || latestValue === null) {
    return 0;
  }

  const recent = weeklyData.slice(-weeks);
  if (recent.length === 0) return 0;

  const valid = recent.map(p => p.y).filter(v => typeof v === 'number' && v >= 0);
  if (valid.length === 0) return 0;

  const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
  if (avg === 0) return latestValue > 0 ? 100 : 0;

  const growth = ((latestValue - avg) / avg) * 100;
  return Number(growth.toFixed(2));
}

// ──────────────────────
// Main Function – Now 100% correct & clean
// ──────────────────────

export async function getOverviewData(
  weekly: Partial<Record<string, { x: string; y: number }[]>>,
  latest: Partial<Record<string, { x: string; y: number }>>
) {
  // Last seen timestamp (prefer IAQ, fallback to CO2)
  const lastTimestamp = latest.iaq_2?.x || latest.co2_0?.x || new Date().toISOString();
  const [num, unit] = formattedLastSeen(lastTimestamp);
  const lastSeenDisplay = `${num}${unit}`;
  const onlineStatus = isOnlineStatus(lastTimestamp);

  // Latest values
  const latestPowerWatts = latest.batP?.y || 0;
  const latestPowerKw = latestPowerWatts / 1000;
  const latestAqi = latest.iaq_2?.y || 0;
  const latestCo2 = latest.co2_0?.y || 0;

  // Quarterly growth: compare latest reading vs avg of last 13 weeks
  const aqiGrowth = calculateQuarterlyGrowth(weekly.iaq_2, latestAqi, 13);
  const co2Growth = calculateQuarterlyGrowth(weekly.co2_0, latestCo2, 13);
  const powerGrowth = calculateQuarterlyGrowth(weekly.solP, latestPowerWatts, 13); // solP is in watts

  return {
    lastSeen: {
      value: onlineStatus,
      growthRate: lastSeenDisplay, // e.g., "5m", "3h", "2d"
    },
    PowerUsage: {
      value: latestPowerKw,        // in kW
      growthRate: powerGrowth,     // % vs last 13 weeks
    },
    co2: {
      value: latestCo2,
      growthRate: -co2Growth,
    },
    aqi: {
      value: latestAqi,
      growthRate: -aqiGrowth,
    },
  };
}