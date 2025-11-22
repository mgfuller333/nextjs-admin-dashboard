// components/Charts/payments-overview/chart.tsx
"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

type PropsType = {
  data: Record<string, { x: string | number; y: number }[]>;
};

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function SensorTimeChart({ data }: PropsType) {
  const isMobile = useIsMobile();

  const series = Object.entries(data).map(([name, points]) => ({
    name,
    data: points,
  }));

  const colors = [
    "#5750F1", "#0ABEF9", "#282623ff", "#10B981", "#EF4444",
    "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#6366F1"
  ];

  const options: ApexOptions = {
    chart: {
      height: 310,
      type: "area",
      toolbar: { show: false },
      fontFamily: "inherit",
      zoom: { enabled: false },
      selection: { enabled: false },
    },
    colors: colors.slice(0, series.length),
    stroke: {
      curve: "smooth",
      width: isMobile ? 2 : 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontSize: "14px",
      markers: { size: 10 },
    },
    dataLabels: { enabled: false },
    tooltip: {
      shared: true,
      intersect: false,
      x: { format: "MMM yyyy" },
    },
    xaxis: {
      type: "category",
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "12px" } },
      tickPlacement: "between",
      crosshairs: { show: true },
    },
    yaxis: {
      labels: { style: { colors: ["transparent"] } }, // ← Fixed: colors (lowercase)
    },
    grid: {
      strokeDashArray: 5,
      yaxis: { lines: { show: true } },
    },
    // ← FIXED: Removed invalid 'normal' state
    states: {
      hover: {
        filter: { type: "none" },
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: { type: "none" },
      },
    },
    noData: {
      text: "No data available",
      align: "center",
      verticalAlign: "middle",
    },
    responsive: [
      { breakpoint: 1024, options: { chart: { height: 300 } } },
      { breakpoint: 1366, options: { chart: { height: 320 } } },
    ],
  };

  return (
    <div className="h-[310px] w-full overflow-hidden touch-none -ml-4 -mr-5">
      <Chart options={options} series={series} type="area" height={310} />
    </div>
  );
}