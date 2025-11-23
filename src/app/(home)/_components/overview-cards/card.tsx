// components/OverviewCard.tsx
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

// EPA-based thresholds
const AIR_QUALITY_THRESHOLDS: Record<string, { good: number; moderate: number }> = {
  pm2_5: { good: 12, moderate: 35.4 },
  iaq_2: { good: 50, moderate: 100 },
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

// Human-readable time ago formatter
const formatTimeAgo = (timeStr: string): string => {
  const match = timeStr.match(/^(\d+)([smhd])$/);
  if (!match) return timeStr;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  if (unit === "s") return value === 1 ? "just now" : `${value} sec${value > 1 ? "s" : ""}`;
  if (unit === "m") return `${value} min${value > 1 ? "s" : ""}`;
  if (unit === "h") return `${value} hr${value > 1 ? "s" : ""}`;
  if (unit === "d") return `${value} day${value > 1 ? "s" : ""}`;

  return timeStr;
};

export function OverviewCard({ label, data, Icon }: PropsType) {
  const isStringGrowth = typeof data.growthRate === "string";
  const isTimeString = isStringGrowth && /^\d+[smhd]$/.test(String(data.growthRate));
  const isStatusMode = isStringGrowth && !isTimeString; // e.g. "Offline", "Online"

  // Detect if lower values are better
  //
  const lowerIsBetter =
    label.toLowerCase().includes("co2") ||
    label.toLowerCase().includes("iaq") ||
    label.toLowerCase().includes("air quality") ||
    label.toLowerCase().includes("pm2") ||
    label.toLowerCase().includes("pm 2");

  const isPositive = isStatusMode
    ? data.growthRate === "Online"
    : lowerIsBetter
      ? (data.growthRate as number) < 0
      : (data.growthRate as number) > 0;

  // Format display text
  const displayGrowth = isTimeString
    ? formatTimeAgo(String(data.growthRate))
    : isStatusMode
      ? String(data.growthRate)
      : `${Math.abs(data.growthRate as number).toFixed(0)}%`;

  const growthIcon = !isTimeString && !isStatusMode && (
    isPositive ? (
      lowerIsBetter ? <ArrowDownIcon aria-hidden /> : <ArrowUpIcon aria-hidden />
    ) : (
      lowerIsBetter ? <ArrowUpIcon aria-hidden /> : <ArrowDownIcon aria-hidden />
    )
  );

  const numericValue = typeof data.value === "number" ? data.value : parseFloat(String(data.value)) || 0;
  const airQualityRing = getAirQualityRing(label, numericValue);

  return (
    <div
      className={cn(
        "rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark transition-shadow hover:shadow-lg",
        // Status/time ring
        (isStatusMode || isTimeString) && (isPositive ? "ring-2 ring-green-500/20" : "ring-2 ring-red-500/20"),
        // Air quality ring takes priority
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

        {(isTimeString || isStatusMode || data.growthRate !== 0) && (
          <dl className={cn("text-sm font-medium", isPositive ? "text-green-600" : "text-red-600")}>
            <dt className="flex items-center gap-1.5">
              {displayGrowth}
              {growthIcon}
            </dt>
          </dl>
        )}
      </div>
    </div>
  );
}