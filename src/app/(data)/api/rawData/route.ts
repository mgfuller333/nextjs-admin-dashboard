// app/api/sensor-data/route.ts
import { BigQuery } from '@google-cloud/bigquery';
import { NextRequest, NextResponse } from 'next/server';

const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const DATASET_ID = 'SireenTest2';
const TABLE_ID = 'Pilot_x8_Test';

const ALLOWED_KEYS = [
  // === BME688 Sensors 0–7 ===
  'iaq_0', 'iaqAcc_0', 'co2_0', 'bvoc_0', 'pres_0', 'gasR_0', 'temp_0', 'hum_0', 'com_gas0',

  // === Power & Battery ===
  'batV', 'batSV', 'batC', 'batP',
  'solV', 'solSV', 'solC', 'solP',
  // === Device Metadata ===
  'device', 'ts', 'bID', 'loc', 'alt', 'satCnt',
  // === Particulate Matter ===
  'pm10', 'pm2_5', 'pm1',
] as const;

type SensorKey = typeof ALLOWED_KEYS[number];

interface RequestBody {
  keys: SensorKey[];
  start?: string; // ISO string
  end?: string;   // ISO string
}

export async function POST(req: NextRequest) {
  console.log('POST /api/sensor-data received');

  try {
    const body: RequestBody = await req.json();

    const { keys: requestedKeys, start, end } = body;

    if (!Array.isArray(requestedKeys) || requestedKeys.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing "keys" array in request body' },
        { status: 400 }
      );
      
    }

    // Validate all keys
    const invalidKeys = requestedKeys.filter(k => !ALLOWED_KEYS.includes(k as any));
    if (invalidKeys.length > 0) {
      return NextResponse.json(
        { error: `Invalid keys: ${invalidKeys.join(', ')}` },
        { status: 400 }
      );
    }

    const keys = requestedKeys as SensorKey[];

    // Date range: use provided or default to last 12 months
    const endDate = end ? new Date(end) : new Date();
    const startDate = start ? new Date(start) : new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate());

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid start or end date format. Use ISO strings.' },
        { status: 400 }
      );
    }

    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Build safe column list
    const selectedColumns = ['ts', ...keys.map(k => `\`${k}\``)].join(', ');

    const query = `
      SELECT ${selectedColumns}
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`
      WHERE ts >= @start AND ts <= @end
      ORDER BY ts DESC
      LIMIT 1000
    `;

    const [rows] = await bigquery.query({
      query,
      location: 'US',
      params: { start: startISO, end: endISO },
    });

    const latestReading = rows.slice(0, 80);

    console.log("rows",latestReading)

    const recentLocations = latestReading.map((x) => x.loc);

   

       console.log("locations",recentLocations)

     const filteredLocations = recentLocations.filter(
  (geo) => geo.value !== 'POINT(0 0)'
);
   console.log("filteredLocations",filteredLocations)


    // Transform into chart-friendly format
    const result: Record<string, { x: string; y: number }[]> = {};
    keys.forEach(key => (result[key] = []));

    rows.forEach((row: any) => {
      const timestamp = typeof row.ts === 'string' ? row.ts : row.ts?.value || new Date().toISOString();

      keys.forEach(key => {
        const value = row[key];
        if (value != null && typeof value === 'number') {
          result[key].push({
            x: timestamp,
            y: Number(value.toFixed(3)),
          });
        }
      });
    });

    console.log(`Success: Returned ${rows.length} rows for keys: ${keys.join(', ')}`);

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('BigQuery POST error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sensor data', details: error.message },
      { status: 500 }
    );
  }
}