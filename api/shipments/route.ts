import { NextResponse } from 'next/server';

export async function GET() {
  const MOCK = process.env.MOCK_MODE === 'true' || process.env.MOCK_MODE === 'TRUE';
  try {
    if (MOCK) {
      const data = (await import('@/data/mockShipments.json')).default;
      return NextResponse.json({ ok: true, data });
    }
    // TODO: add real provider calls here using env vars
    const shipments:any[] = [];
    return NextResponse.json({ ok: true, data: shipments });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message }, { status: 500 });
  }
}
