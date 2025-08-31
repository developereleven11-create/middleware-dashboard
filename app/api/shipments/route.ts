import { NextResponse } from 'next/server';
import mockShipments from '../../../data/mockShipments.json';

export async function GET() {
  const MOCK = process.env.MOCK_MODE !== 'false';

  try {
    if (MOCK) {
      return NextResponse.json({ ok: true, data: mockShipments });
    }

    // TODO: integrate with real shipment provider API
    return NextResponse.json(
      { ok: false, error: 'Shipment provider not wired yet' },
      { status: 500 }
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
