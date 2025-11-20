import { BigQuery } from '@google-cloud/bigquery';
import { NextRequest, NextResponse } from 'next/server';

// Initialize BigQuery client
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

// Define dataset and table IDs
const DATASET_ID = 'SireenTest2'; // Replace with your BigQuery dataset ID
const TABLE_ID = 'Pilot_x8_Test'; // Replace with your BigQuery table ID

const ALLOWED_KEYS = [
  // === BME688 Sensors 0–7 (8 total) ===
  // Sensor 0
  'iaq_0', 'iaqAcc_0', 'co2_0', 'bvoc_0', 'pres_0', 'gasR_0', 'temp_0', 'hum_0', 'com_gas0',
  // Sensor 1
  'iaq_1', 'iaqAcc_1', 'co2_1', 'bvoc_1', 'pres_1', 'gasR_1', 'temp_1', 'hum_1', 'com_gas1',
  // Sensor 2
  'iaq_2', 'iaqAcc_2', 'co2_2', 'bvoc_2', 'pres_2', 'gasR_2', 'temp_2', 'hum_2', 'com_gas2',
  // Sensor 3
  'iaq_3', 'iaqAcc_3', 'co2_3', 'bvoc_3', 'pres_3', 'gasR_3', 'temp_3', 'hum_3', 'com_gas3',
  // Sensor 4
  'iaq_4', 'iaqAcc_4', 'co2_4', 'bvoc_4', 'pres_4', 'gasR_4', 'temp_4', 'hum_4', 'com_gas4',
  // Sensor 5
  'iaq_5', 'iaqAcc_5', 'co2_5', 'bvoc_5', 'pres_5', 'gasR_5', 'temp_5', 'hum_5', 'com_gas5',
  // Sensor 6
  'iaq_6', 'iaqAcc_6', 'co2_6', 'bvoc_6', 'pres_6', 'gasR_6', 'temp_6', 'hum_6', 'com_gas6',
  // Sensor 7
  'iaq_7', 'iaqAcc_7', 'co2_7', 'bvoc_7', 'pres_7', 'gasR_7', 'temp_7', 'hum_7', 'com_gas7',

  // === Power & Battery ===
  'batV', 'batSV', 'batC', 'batP',
  'solV', 'solSV', 'solC', 'solP',

  // === Device Metadata ===
  'device', 'ts', 'bID', 'loc', 'alt', 'satCnt',

  // === Particulate Matter (PM) ===
  'pm10', 'pm2_5', 'pm1',
] as const;



export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    // Parse keys
    const keysParam = searchParams.getAll('keys');
    const keyParam = searchParams.get('key');
    const keys = keysParam.length > 0
      ? keysParam.map(k => k.trim()).filter(Boolean)
      : keyParam ? [keyParam.trim()] : [];

    if (keys.length === 0) {
      return NextResponse.json(
        { error: 'Missing ?keys=solV&keys=batV or ?key=solV' },
        { status: 400 }
      );
    }

    // Validate keys
    const invalidKeys = keys.filter(key => !ALLOWED_KEYS.includes(key as any));
    if (invalidKeys.length > 0) {
      return NextResponse.json(
        { error: `Invalid keys: ${invalidKeys.join(', ')}` },
        { status: 400 }
      );
    }

    // Optional: custom start/end
    let start = searchParams.get('start');
    let end = searchParams.get('end');

    // Default: last 12 months
    if (!start || !end) {
      const now = new Date();
      end = now.toISOString();
      start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString();
    }

    // Build SQL — NO LIMIT, use WHERE for efficiency
    const selectedColumns = [`ts`, ...keys.map(k => `\`${k}\``)].join(', ');
    const query = `
      SELECT ${selectedColumns}
      FROM \`${DATASET_ID}.${TABLE_ID}\`
      WHERE ts >= ${start} AND ts <= ${end}
      ORDER BY ts ASC
      LIMIT 100
    `;

    const options = {
      query,
      location: 'US',
      params: { start, end },
    };

    const [rows] = await bigquery.query(options);

    // Transform to { solV: [{x: "...", y: 4.9}, ...], ... }
    const result: Record<string, { x: string; y: number }[]> = {};
    keys.forEach(key => result[key] = []);

    rows.forEach((row: any) => {
      const timestamp = row.ts.value || row.ts; // handle both formats
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

    console.log(`Fetched ${rows.length} rows from ${start} to ${end}`);

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('BigQuery error:', error);
    return NextResponse.json(
      { error: 'Failed to query data', details: error.message },
      { status: 500 }
    );
  }
}