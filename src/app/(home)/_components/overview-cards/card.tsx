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
export function OverviewCard({ label, data, Icon }: PropsType) {
  const isStringGrowth = typeof data.growthRate === 'string';
  // Enhanced check: Skip % if string and matches time pattern (e.g., "45s", "3m", "2h", "99d")
  // This covers "last seen/update" times without assuming all strings are status
  const isTimeString = isStringGrowth && /^\d+[smhd]$/.test(data.growthRate);
  const isStatusMode = isStringGrowth && !isTimeString; // e.g., "Online" | "Offline"

  const isPositive = isStatusMode 
    ? data.growthRate === 'Online' // Green if online
    : !isTimeString && (data.growthRate as number) > 0; // Numeric growth (skip for time)
  const isDecreasing = !isPositive;

  const growthText = isTimeString || isStatusMode
    ? data.growthRate // Raw "45s" or "Online" – no %
    : `${(data.growthRate as number)}%`; // Only for pure numerics

  const growthIcon = !isStatusMode && !isTimeString && (
    isDecreasing ? <ArrowDownIcon aria-hidden /> : <ArrowUpIcon aria-hidden />
  );

  const srOnlyText = isTimeString
    ? `${label} updated ${(data.growthRate as string).toLowerCase()} ago` // Tailored for time strings
    : isStatusMode 
      ? `${label} is ${(data.growthRate as string).toLowerCase()}`
      : `${label} ${isDecreasing ? "decreased" : "increased"} by ${Math.abs(data.growthRate as number)}%`;

  return (
    <div 
      className={cn(
        "rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark",
        (isStatusMode || isTimeString) && (isPositive ? "ring-2 ring-green/20" : "ring-2 ring-red/20")
      )}
    >
      <Icon className={cn(isPositive ? "text-green" : "text-red")} />

      <div className="mt-6 flex items-end justify-between">
        <dl>
          <dt className="mb-1.5 text-heading-6 font-bold text-dark dark:text-white">
            {data.value}
          </dt>
          <dd className="text-sm font-medium text-dark-6">{label}</dd>
        </dl>

        <dl
          className={cn(
            "text-sm font-medium",
            isPositive ? "text-green" : "text-red",
          )}
        >
          <dt className="flex items-center gap-1.5">
            {growthText}
            {growthIcon}
          </dt>
          <dd className="sr-only">{srOnlyText}</dd>
        </dl>
      </div>
    </div>
  );
}