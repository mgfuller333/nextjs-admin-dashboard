// components/Charts/payments-overview/index.tsx

import { SensorTimeChart } from "./chart";
import { SensorPicker } from "@/components/period-picker";
import { cn } from "@/lib/utils";

type Props = {
  timeFrame?: string;
  className?: string;
  searchParams?: Record<string, string | string[] | undefined>;
  // Accept partial data — some sensors may be missing
  data: Partial<Record<string, { x: string; y: number }[]>>;
};

export default async function PaymentsOverview({
  timeFrame = "monthly",
  className,
  searchParams = {},
  data: rawData,
}: Props) {

 
   // Normalize: ensure every sensor has an array (never undefined)
  const rawSensorData = Object.fromEntries(
    Object.entries(rawData).map(([key, values]) => [key, values ?? []])
  ) as Record<string, { x: string; y: number }[]>;


  return (
    <div
      className={cn(
        "rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
           Overview
        </h2>

        <SensorPicker
          defaultValue={['solP', 'batP']}
          intialData={rawSensorData}
        />
      </div>

      {/* Chart */}
      <div className="mt-6">
        <SensorTimeChart/>
      </div>

      {/* Stats: highest value per sensor */}
      {/* <dl className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-6 overflow-x-auto pb-3 text-center">
        {Object.entries(filteredSensorData).map(([key, values]) => {
          if (values.length === 0) {
            return (
              <div key={key} className="flex flex-col items-center px-2">
                <dt className="text-2xl font-bold text-muted-foreground">—</dt>
                <dd className="text-xs text-muted-foreground mt-1">{key}</dd>
              </div>
            );
          }

          const highest = values.reduce((max, point) =>
            point.y > max.y ? point : max
          );

          const sensorCount = Object.keys(filteredSensorData).length;
          const valueSize =
            sensorCount <= 3 ? "text-2xl" :
            sensorCount <= 5 ? "text-xl" :
            sensorCount <= 7 ? "text-lg" : "text-base";

          return (
            <div key={key} className="flex flex-col items-center whitespace-nowrap px-2">
              <dt className={`${valueSize} font-bold text-dark dark:text-white`}>
                {highest.y.toFixed(1)}
              </dt>
              <dd className="text-xs text-muted-foreground mt-1 leading-none">
                {key} • {highest.x}
              </dd>
            </div>
          );
        })}
      </dl> */}
    </div>
  );
}