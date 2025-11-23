// app/page.tsx
import { Suspense } from 'react';
import { createTimeFrameExtractor } from '@/utils/timeframe-extractor';
import PaymentsOverview from '@/components/Charts/payments-overview';
import { OverviewCardsGroup } from './_components/overview-cards';
import { OverviewCardsSkeleton } from './_components/overview-cards/skeleton';
import { ChatsCard } from './_components/chats-card';
import { TopChannels } from '@/components/Tables/top-channels';
import { TopChannelsSkeleton } from '@/components/Tables/top-channels/skeleton';
import { getWeeklyData } from '@/services/charts.services';
import type { SensorKey, SensorPoint } from '@/types/sensor';
import ChatbotButton from '@/components/chatbot';
import { WeeksProfit } from '@/components/Charts/weeks-profit';

const initialKeys: SensorKey[] = ['solP', 'batP', 'pm2_5', 'iaq_2', 'co2_0'] as const;

type Props = {
  searchParams: Promise<{
    selected_time_frame?: string;
    sensors?: string | string[];
  }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  createTimeFrameExtractor(params.selected_time_frame); // keep if you use it elsewhere

  // 1. One server fetch – raw points for all sensors
  const rawPayload = await getWeeklyData(undefined, initialKeys);

  // 2. Server-side aggregation
  const weeklyAverages = computeWeeklyFromRaw(rawPayload, initialKeys);
  const latestReadings = computeDailyFromRaw(rawPayload, initialKeys);
  const monthlyReadings = computeMonthlyFromRaw(rawPayload, initialKeys);

  console.log('Weekly Averages:', weeklyAverages);

 const overviewData = {
  weekly: weeklyAverages,
  latest: latestReadings,
};
  console.log('Overview Data:', overviewData);

  return (
    <>

              <div className="col-span-12 grid xl:col-span-8 pb-4">

<Suspense fallback={<TopChannelsSkeleton />}>
            <TopChannels dailyReadings={latestReadings}/>
          
          </Suspense>

          </div>
       
     



        <Suspense fallback={null}>
            <ChatsCard  {...overviewData}/>
        </Suspense>

      <Suspense fallback={<OverviewCardsSkeleton />}>
  <OverviewCardsGroup {...overviewData} />
</Suspense>


       <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <Suspense fallback={null}>
          <PaymentsOverview className="col-span-12 xl:col-span-7" data={monthlyReadings} />
         </Suspense>


            <WeeksProfit
      
          timeFrame={'weekly'}
          className="col-span-12 xl:col-span-5"
          inputData={weeklyAverages}
        /> 

      



          <ChatbotButton latestData={latestReadings} weeklyData={weeklyAverages} monthlyData={monthlyReadings} />
      </div>
    </>
  );
}

/* ────── Server-side helpers (pure functions – no React) ────── */

function computeWeeklyFromRaw(
  raw: Partial<Record<SensorKey, SensorPoint[]>>,
  keys: SensorKey[]
): Partial<Record<SensorKey, { x: string; y: number }[]>> {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const result: Partial<Record<SensorKey, { x: string; y: number }[]>> = {};

  keys.forEach((key) => {
    const buckets: Record<string, number[]> = {};

    // initialise every bucket (prevents missing keys)
    months.forEach((m) => {
      for (let w = 1; w <= 5; w++) buckets[`${m}_${w}`] = [];
    });

    // fill buckets
    (raw[key] ?? []).forEach((p) => {
      const d = new Date(p.x);
      const month = new Date(p.x).toLocaleString('en-GB', { month: 'short' });
      const week = Math.min(Math.ceil(d.getDate() / 7), 5);
      buckets[`${month}_${week}`].push(p.y);
    });

    // build final array in correct order
    result[key] = [];
    months.forEach((m) => {
      for (let w = 1; w <= 5; w++) {
        const values = buckets[`${m}_${w}`];
        const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        result[key]!.push({ x: `${m}_${w}`, y: Number(avg.toFixed(2)) });
      }
    });
  });

  return result;
}

function computeDailyFromRaw(
  raw: Partial<Record<SensorKey, SensorPoint[]>>,
  keys: SensorKey[]
): Partial<Record<SensorKey, { x: string; y: number }>> {
  const result: Partial<Record<SensorKey, { x: string; y: number }>> = {};

  keys.forEach((key) => {
    const points = raw[key] ?? [];
    if (!points.length) {
      result[key] = { x: '', y: 0 };
      return;
    }

    const latest = points.reduce((max, p) =>
      new Date(p.x) > new Date(max.x) ? p : max
    );

    result[key] = { x: latest.x, y: Number(latest.y.toFixed(2)) };
  });

  return result;
}

function computeMonthlyFromRaw(
  raw: Partial<Record<SensorKey, SensorPoint[]>>,
  keys: SensorKey[]
): Partial<Record<SensorKey, { x: string; y: number }[]>> {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const result: Partial<Record<SensorKey, { x: string; y: number }[]>> = {};

  keys.forEach((key) => {
    const buckets: Record<string, number[]> = {};
    months.forEach(m => buckets[m] = []);

    (raw[key] ?? []).forEach(p => {
      const month = new Date(p.x).toLocaleString('en-GB', { month: 'short' });
      buckets[month].push(p.y);
    });

    result[key] = months.map(month => {
      const values = buckets[month];
      const avg = values.length ? values.reduce((a,b) => a+b, 0) / values.length : 0;
      return { x: month, y: Number(avg.toFixed(2)) };
    });
  });

  return result;
}