import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const MOCK = process.env.MOCK_MODE !== 'false';
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    let orders: any[] = [];
    let shipments: any[] = [];

    if (MOCK) {
      const oRes = await fetch(`${baseUrl}/data/mockOrders.json`);
      orders = await oRes.json();

      const sRes = await fetch(`${baseUrl}/data/mockShipments.json`);
      shipments = await sRes.json();
    } else {
      const ordersRes = await fetch(`${baseUrl}/api/orders`, { cache: 'no-store' });
      const ordersJson = await ordersRes.json();
      orders = ordersJson.data ?? [];

      const shipmentsRes = await fetch(`${baseUrl}/api/shipments`, { cache: 'no-store' });
      const shipmentsJson = await shipmentsRes.json();
      shipments = shipmentsJson.data ?? [];
    }

    // Debug response
    return NextResponse.json({ debugOrders: orders, debugShipments: shipments });

  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
