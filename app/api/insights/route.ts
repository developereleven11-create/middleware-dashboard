import { NextResponse } from 'next/server';
import mockOrders from '../../../data/mockOrders.json';
import mockShipments from '../../../data/mockShipments.json';

export async function GET() {
  try {
    const MOCK = process.env.MOCK_MODE !== 'false';

    let orders: any[] = [];
    let shipments: any[] = [];

    if (MOCK) {
      orders = mockOrders as any[];
      shipments = mockShipments as any[];
    } else {
      // fetch real Shopify orders
      const ordersRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/orders`, {
        cache: 'no-store',
      });
      const ordersJson = await ordersRes.json();
      orders = ordersJson.data ?? [];

      // fetch real shipments (placeholder until provider is integrated)
      const shipmentsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/shipments`, {
        cache: 'no-store',
      });
      const shipmentsJson = await shipmentsRes.json();
      shipments = shipmentsJson.data ?? [];
    }

    // classify orders
    const rto = orders.filter((o: any) =>
      shipments.find((s: any) => s.order_number === o.order_number && s.rto)
    );

    const ofd = orders.filter((o: any) =>
      shipments.find(
        (s: any) =>
          s.order_number === o.order_number && /ofd|out for delivery/i.test(s.status)
      )
    );

    const inTransit = orders.filter((o: any) =>
      shipments.find(
        (s: any) =>
          s.order_number === o.order_number && /transit/i.test(s.status)
      )
    );

    return NextResponse.json({ rto, ofd, inTransit });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
