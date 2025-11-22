import { ArrowDownIcon, ArrowUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import type { JSX, SVGProps } from "react";

type GrowthRate = number | string;

type PropsType = {
  label: string;
  data: {
    value: number | string;
    growthRate: GrowthRate;
  };
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
};

// EPA-based thresholds for outdoor sensors
const AIR_QUALITY_THRESHOLDS: Record<string, { good: number; moderate: number }> = {
  pm2_5: { good: 12, moderate: 35.4 },
  iaq_2: { good: 50, moderate: 100 },   // 50 = Good → your value 50 gets green ring
  co2_0: { good: 800, moderate: 1200 },
};

const getAirQualityRing = (label: string, value: number) => {
  const lowerLabel = label.toLowerCase();
  let key: keyof typeof AIR_QUALITY_THRESHOLDS | null = null;

  if (lowerLabel.includes("pm2") || lowerLabel.includes("pm 2")) key = "pm2_5";
  if (lowerLabel.includes("iaq") || lowerLabel.includes("air quality")) key = "iaq_2";
  if (lowerLabel.includes("co2") || lowerLabel.includes("co 2")) key = "co2_0";

  if (!key) return null;

  const t = AIR_QUALITY_THRESHOLDS[key];
  if (value <= t.good) return "ring-2 ring-green-500/30";
  if (value <= t.moderate) return "ring-2 ring-yellow-500/30";
  return "ring-2 ring-red-500/30";
};

export function OverviewCard({ label, data, Icon }: PropsType) {
  const isStringGrowth = typeof data.growthRate === "string";
  const isTimeString = isStringGrowth && /^\d+[smhd]$/.test(String(data.growthRate));
  const isStatusMode = isStringGrowth && !isTimeString; // e.g. "Offline"

  // Detect if lower values are better (air quality)
  const lowerIsBetter = label.toLowerCase().includes("co2") ||
                        label.toLowerCase().includes("iaq") ||
                        label.toLowerCase().includes("air quality") ||
                        label.toLowerCase().includes("pm2") ||
                        label.toLowerCase().includes("pm 2");

  // Determine if change is positive (green)
  const isPositive = isStatusMode
    ? data.growthRate === "Online"
    : lowerIsBetter
      ? (data.growthRate as number) < 0   // Decrease = improvement
      : (data.growthRate as number) > 0;  // Increase = improvement

  const growthText = isTimeString || isStatusMode
    ? data.growthRate
    : `${(data.growthRate as number).toFixed(0)}%`;

  const growthIcon = !isStatusMode && !isTimeString && (
    lowerIsBetter ? <ArrowDownIcon aria-hidden /> : <ArrowUpIcon aria-hidden />
  );

  const numericValue = typeof data.value === "number" ? data.value : parseFloat(String(data.value)) || 0;
  const airQualityRing = getAirQualityRing(label, numericValue);

  return (
    <div
      className={cn(
        "rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark transition-shadow hover:shadow-lg",
        // Status/time ring (Last Update, Online/Offline)
        (isStatusMode || isTimeString) && (isPositive ? "ring-2 ring-green-500/20" : "ring-2 ring-red-500/20"),
        // Air quality ring (IAQ, CO2, PM2.5) — takes priority
        airQualityRing
      )}
    >
      <Icon className={cn("h-10 w-10", isPositive ? "text-green-600" : "text-red-600")} />

      <div className="mt-6 flex items-end justify-between">
        <dl>
          <dt className="mb-1.5 text-heading-6 font-bold text-dark dark:text-white">
            {data.value}
          </dt>
          <dd className="text-sm font-medium text-dark-6 dark:text-light-5">{label}</dd>
        </dl>

        {!isTimeString && (
          <dl className={cn("text-sm font-medium", isPositive ? "text-green-600" : "text-red-600")}>
            <dt className="flex items-center gap-1.5">
              {growthText}
              {growthIcon}
            </dt>
          </dl>
        )}
      </div>
    </div>
  );
}