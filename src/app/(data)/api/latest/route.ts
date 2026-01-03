// app/api/sensor-latest/route.ts
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
  'iaq_0', 'iaqAcc_0', 'co2_0', 'bvoc_0', 'pres_0', 'gasR_0', 'temp_0', 'hum_0', 'com_gas0',
  'batV', 'batSV', 'batC', 'batP',
  'solV', 'solSV', 'solC', 'solP',
  'device', 'ts', 'bID', 'loc', 'alt', 'satCnt',
  'pm10', 'pm2_5', 'pm1',
] as const;

type SensorKey = typeof ALLOWED_KEYS[number];

interface RequestBody {
  keys?: SensorKey[]; // Optional — defaults to a smart set
  device?: string;    // Optional filter by device ID
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { keys: requestedKeys, device } = body;

    // Default keys if none provided
    const defaultKeys: SensorKey[] = ['iaq_0', 'co2_0', 'batP', 'solP', 'temp_0', 'hum_0', 'pm2_5'];
    const keys = (requestedKeys?.length ? requestedKeys : defaultKeys)
      .filter((k): k is SensorKey => ALLOWED_KEYS.includes(k as any));

    if (keys.length === 0) {
      return NextResponse.json(
        { error: 'No valid keys provided and no defaults available' },
        { status: 400 }
      );
    }

    // Build dynamic column list
    const columns = ['ts', ...keys.map(k => `\`${k}\``)].join(', ');

    let query = `
      SELECT ${columns}
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`
    `;

    // Optional: filter by device
    if (device) {
      query += `\nWHERE device = @device`;
    }

    query += `
      ORDER BY ts DESC
      LIMIT 1
    `;

    const options: any = {
      query,
      location: 'US',
    };

    // Add params only if needed
    if (device) {
      options.params = { device };
    }

    const [rows] = await bigquery.query(options);

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: 'No data found for the latest timestamp', data: null },
        { status: 200 }
      );
    }

    const latest = rows[0];

    // Transform to clean format
    const result = {
      ts: latest.ts?.value || latest.ts || new Date().toISOString(),
      values: keys.reduce((acc, key) => {
        const val = latest[key];
        acc[key] = val != null ? Number(Number(val).toFixed(3)) : null;
        return acc;
      }, {} as Record<string, number | null>),
    };

    console.log(`Latest values fetched for keys: ${keys.join(', ')}${device ? ` (device: ${device})` : ''}`);

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('BigQuery latest values error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest sensor values', details: error.message },
      { status: 500 }
    );
  }
}