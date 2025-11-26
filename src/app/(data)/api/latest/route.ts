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
  'iaq_1', 'iaqAcc_1', 'co2_1', 'bvoc_1', 'pres_1', 'gasR_1', 'temp_1', 'hum_1', 'com_gas1',
  'iaq_2', 'iaqAcc_2', 'co2_2', 'bvoc_2', 'pres_2', 'gasR_2', 'temp_2', 'hum_2', 'com_gas2',
  'iaq_3', 'iaqAcc_3', 'co2_3', 'bvoc_3', 'pres_3', 'gasR_3', 'temp_3', 'hum_3', 'com_gas3',
  'iaq_4', 'iaqAcc_4', 'co2_4', 'bvoc_4', 'pres_4', 'gasR_4', 'temp_4', 'hum_4', 'com_gas4',
  'iaq_5', 'iaqAcc_5', 'co2_5', 'bvoc_5', 'pres_5', 'gasR_5', 'temp_5', 'hum_5', 'com_gas5',
  'iaq_6', 'iaqAcc_6', 'co2_6', 'bvoc_6', 'pres_6', 'gasR_6', 'temp_6', 'hum_6', 'com_gas6',
  'iaq_7', 'iaqAcc_7', 'co2_7', 'bvoc_7', 'pres_7', 'gasR_7', 'temp_7', 'hum_7', 'com_gas7',
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