// components/Charts/weeks-profit/chart.tsx
"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Props = {
  data: Record<string, { x: string; y: number }[]>;
  labels?: Record<string, string>;
};

const DEFAULT_LABELS = {
  solP: "PowerGen",
  batP: "PowerUse",
  pm2_5: "PM2.5",
  iaq_2: "AQI",
  co2_0: "CO2",
} as const;

export function WeeksProfitChart({ data, labels = DEFAULT_LABELS }: Props) {
  const now = new Date();
  const currentMonth = now.toLocaleString('en-GB', { month: 'short' });
  const currentWeekNum = Math.min(Math.ceil(now.getDate() / 7), 5);
  const currentWeekKey = `${currentMonth}_${currentWeekNum}`;

  // Transform into your desired flat array: [{ x: "label", y: value }]
  const weeklyAvg = Object.entries(data)
    .map(([key, points]) => {
      const point = points.find(p => p.x === currentWeekKey);
      if (!point || point.y === 0) return null; // skip zero or missing
      return {
        x: labels[key as keyof typeof labels] || key,
        y: Math.round(point.y), // or .toFixed(0) if you want string
      };
    })
    .filter(Boolean) as { x: string; y: number }[];

  // Sort by label (optional — looks nicer)
  weeklyAvg.sort((a, b) => a.x.localeCompare(b.x));

  // If no data, show friendly message
  if (weeklyAvg.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center text-muted-foreground">
        <p className="text-lg font-medium">No data this week</p>
        <p className="mt-2 text-sm">Week: <strong>{currentWeekKey}</strong></p>
      </div>
    );
  }

  const options: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    colors: ["#5750F1", "#0ABEF9", "#FF4560", "#00E396", "#775DD0"],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 8,
        columnWidth: "55%",
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -25,
      style: { fontSize: "13px", fontWeight: "bold", colors: ["#1f2937"] },
    },
    xaxis: {
      categories: weeklyAvg.map(d => d.x),
      labels: { rotate: 0, style: { fontSize: "12px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { show: false },
    grid: { show: false },
    legend: { show: false },
    tooltip: { enabled: false },
    title: {
      text: `This Week • ${currentWeekKey}`,
      align: "center",
      style: { fontSize: "16px", fontWeight: "600", color: "#374151" },
    },
  };

  const series = [{
    name: "Weekly Average",
    data: weeklyAvg.map(d => d.y),
  }];

  return (
    <div className="px-6">
      <Chart
        options={options}
        series={series}
        type="bar"
        height={380}
      />
    </div>
  );
}