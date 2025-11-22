// components/Charts/payments-overview/chart.tsx
"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type PropsType = {
  data: Record<string, { x: string | number; y: number }[]>;
};

export function SensorTimeChart({ data }: PropsType) {
  const isMobile = useIsMobile();

  const series = Object.entries(data).map(([name, points]) => ({
    name,
    data: points,
  }));

  const dataPointCount = series[0]?.data.length ?? 0;

  const colors = [
    "#5750F1",
    "#0ABEF9",
    "#282623",
    "#10B981",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F97316",
    "#6366F1",
  ];

  const options: ApexOptions = useMemo(() => ({
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
      show: series.length > 1,
      position: "top",
      horizontalAlign: "left",
      fontSize: "14px",
      markers: {
        // Correct way: use `size` instead of width/height
        size: 10,
      },
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
      axisTicks: { show: true, height: 6 },
      tickPlacement: "between",
      crosshairs: { show: true },
      tickAmount: isMobile
        ? dataPointCount >= 12
          ? 6
          : Math.max(3, dataPointCount - 1)
        : undefined,
      labels: {
        style: { fontSize: "12px" },
        rotate: isMobile ? -45 : 0,
        formatter: (value: string) => {
          try {
            if (/^\d{4}-\d{2}$/.test(value)) {
              const [y, m] = value.split("-");
              const date = new Date(parseInt(y), parseInt(m) - 1);
              return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
            }
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
            }
          } catch {}
          return value;
        },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#9CA3AF", fontSize: "12px" },
      },
    },
    grid: {
      strokeDashArray: 5,
      borderColor: "#E5E7EB",
      yaxis: { lines: { show: true } },
    },
    states: {
      hover: { filter: { type: "none" } },
      active: { filter: { type: "none" } },
    },
    noData: {
      text: "No data available",
      align: "center",
      verticalAlign: "middle",
      offsetX: 0,
      offsetY: 0,
      style: {
        fontSize: "14px",
        color: "#6B7280",
      },
    },
    responsive: [
      { breakpoint: 1024, options: { chart: { height: 300 } } },
      { breakpoint: 1366, options: { chart: { height: 320 } } },
    ],
  }), [isMobile, series.length, dataPointCount]);

  // Prevent any server-side flash or type error


  return (
    <div className="h-[310px] w-full overflow-hidden touch-none -ml-4 -mr-5 md:ml-0 md:mr-0">
      <Chart
        options={options}
        series={series.length > 0 ? series : []}
        type="area"
        height={310}
      />
    </div>
  );
}