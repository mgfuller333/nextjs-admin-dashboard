// components/Charts/weeks-profit/index.tsx
import { WeeksProfitChart } from "./chart";
import { cn } from "@/lib/utils";

type Props = {
  timeFrame?: string;
  className?: string;
  // This is exactly what computeWeeklyFromRaw() returns
  inputData?: Partial<Record<string, { x: string; y: number }[]>>;
};

const SENSOR_LABELS = {
  solP: "Pwr Gen (W)",
  batP: "Pwr Use (W)",
  iaq_2: "IAQ",
  co2_0: "CO₂",
  pm2_5: "PM2.5",
} as const;

export async function WeeksProfit({ className, timeFrame, inputData = {} }: Props) {
  // Normalize: convert Partial → full Record with empty arrays for missing keys
  const data = Object.fromEntries(
    Object.entries(inputData).map(([key, values]) => [key, values ?? []])
  ) as Record<string, { x: string; y: number }[]>;

  // Optional: only show sensors that actually have data
  const hasData = Object.values(data).some(arr => arr.length > 0);

  return (
    <div
      className={cn(
        "rounded-[10px] bg-white px-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className
      )}
    >
      <h2 className="mb-6 text-body-2xlg font-bold text-dark dark:text-white">
        Weekly Averages {timeFrame ? `– ${timeFrame}` : ""}
      </h2>

      {hasData ? (
        <WeeksProfitChart data={data} labels={SENSOR_LABELS} />
      ) : (
        <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
          <p className="text-lg">No weekly data available yet</p>
          <p className="mt-2 text-sm">Check back after the first week of readings</p>
        </div>
      )}
    </div>
  );
}