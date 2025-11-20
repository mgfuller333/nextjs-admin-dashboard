// app/_components/overview-cards/group.tsx
import { compactFormat } from "@/lib/format-number";
import { getOverviewData } from "../../fetch";
import { OverviewCard } from "./card";
import * as icons from "./icons";

type KPIProps = {
  weekly: Partial<Record<string, { x: string; y: number }[]>>;
  latest: Partial<Record<string, { x: string; y: number }>>;
};

export async function OverviewCardsGroup({ weekly, latest }: KPIProps) {
  // These now come directly from props
  console.log("OverviewCardsGroup - weekly:", weekly);
  console.log("OverviewCardsGroup - latest:", latest);

  const { lastSeen, PowerUsage, co2, aqi } = await getOverviewData(weekly, latest);

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <OverviewCard
        label="Last Update"
        data={{ ...lastSeen, value: lastSeen.value }}
        Icon={icons.Views}
      />

      <OverviewCard
        label="Power Usage (kWh)"
        data={{ ...PowerUsage, value: compactFormat(PowerUsage.value) }}
        Icon={icons.Profit}
      />

      <OverviewCard
        label="Air Quality Index"
        data={{ ...aqi, value: compactFormat(aqi.value) }}
        Icon={icons.Product}
      />

      <OverviewCard
        label="CO2 Level (PPM)"
        data={{ ...co2, value: compactFormat(co2.value) }}
        Icon={icons.Users}
      />
    </div>
  );
}