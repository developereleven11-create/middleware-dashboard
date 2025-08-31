import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  const MOCK = process.env.MOCK_MODE !== 'false';

  try {
    if (MOCK) {
      const file = path.join(process.cwd(), 'data', 'mockShipments.json');
      const content = await fs.readFile(file, 'utf-8');
      const data = JSON.parse(content);
      return NextResponse.json({ ok: true, data });
    }

    // TODO: integrate real shipment provider
    return NextResponse.json(
      { ok: false, error: 'Shipment provider not wired yet' },
      { status: 500 }
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
