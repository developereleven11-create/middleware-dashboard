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
      try {
        const oRes = await fetch(`${baseUrl}/data/mockOrders.json`);
        orders = await oRes.json();
      } catch {
        orders = [];
      }

      try {
        const sRes = await fetch(`${baseUrl}/data/mockShipments.json`);
        shipments = await sRes.json();
      } catch {
        shipments = [];
      }
    } else {
      try {
        const ordersRes = await fetch(`${baseUrl}/api/orders`, { cache: 'no-store' });
        const ordersJson = await ordersRes.json();
        orders = ordersJson.data ?? [];
      } catch {
        orders = [];
      }

      try {
        const shipmentsRes = await fetch(`${baseUrl}/api/shipments`, { cache: 'no-store' });
        const shipmentsJson = await shipmentsRes.json();
        shipments = shipmentsJson.data ?? [];
      } catch {
        shipments = [];
      }
    }

    const rto = orders.filter((o: any) =>
      shipments.find((s: any) => s.order_number === o.order_number && s.rto)
    );

    const ofd = orders.filter((o: any) =>
      shipments.find(
        (s: any) =>
          s.order_number === o.order_number &&
          /ofd|out for delivery/i.test(s.status)
      )
    );

    const inTransit = orders.filter((o: any) =>
      shipments.find(
        (s: any) =>
          s.order_number === o.order_number &&
          /transit/i.test(s.status)
      )
    );

    return NextResponse.json({ rto, ofd, inTransit });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
