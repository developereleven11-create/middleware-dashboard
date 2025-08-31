import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const MOCK = process.env.MOCK_MODE !== 'false';

    let orders: any[] = [];
    let shipments: any[] = [];

    if (MOCK) {
      const oRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/data/mockOrders.json`);
      orders = await oRes.json();

      const sRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/data/mockShipments.json`);
      shipments = await sRes.json();
    } else {
      const ordersRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/orders`, { cache: 'no-store' });
      const ordersJson = await ordersRes.json();
      orders = ordersJson.data ?? [];

      const shipmentsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/shipments`, { cache: 'no-store' });
      const shipmentsJson = await shipmentsRes.json();
      shipments = shipmentsJson.data ?? [];
    }

    const rto = orders.filter((o: any) =>
      shipments.find((s: any) => s.order_number === o.order_number && s.rto)
    );

    const ofd = orders.filter((o: any) =>
      shipments.find((s: any) => s.order_number === o.order_number && /ofd|out for delivery/i.test(s.status))
    );

    const inTransit = orders.filter((o: any) =>
      shipments.find((s: any) => s.order_number === o.order_number && /transit/i.test(s.status))
    );

    return NextResponse.json({ rto, ofd, inTransit });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
