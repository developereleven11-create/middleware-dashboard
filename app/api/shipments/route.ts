import { NextResponse } from 'next/server';

export async function GET() {
  const MOCK = process.env.MOCK_MODE !== 'false';

  try {
    if (MOCK) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/data/mockShipments.json`);
      const data = await res.json();
      return NextResponse.json({ ok: true, data });
    }

    // TODO: integrate real shipment provider API
    return NextResponse.json(
      { ok: false, error: 'Shipment provider not wired yet' },
      { status: 500 }
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
