import { NextResponse } from 'next/server';
import { GET as getOrders } from '../orders/route';
import { GET as getShipments } from '../shipments/route';

function mergeOrdersWithShipments(
  orders: any[],
  shipments: any[],
  filterFn: (s: any) => boolean
) {
  return orders
    .map((o) => {
      const shipment = shipments.find(
        (s: any) => s.order_number === o.order_number && filterFn(s)
      );
      return shipment ? { ...o, shipment } : { ...o };
    })
    .filter(Boolean);
}

export async function GET() {
  try {
    const dummyReq = new Request('http://localhost');

    // Orders API (requires req)
    const ordersRes: any = await getOrders(dummyReq);
    const ordersJson = await ordersRes.json();
    const orders: any[] = ordersJson.data ?? [];

    // Shipments API (no req needed)
    let shipments: any[] = [];
    try {
      const shipmentsRes: any = await getShipments();
      const shipmentsJson = await shipmentsRes.json();
      shipments = shipmentsJson.data ?? [];
    } catch {
      shipments = [];
    }

    const rto = mergeOrdersWithShipments(orders, shipments, (s) => s.rto);
    const ofd = mergeOrdersWithShipments(orders, shipments, (s) =>
      /ofd|out for delivery/i.test(s.status)
    );
    const inTransit = mergeOrdersWithShipments(orders, shipments, (s) =>
      /transit/i.test(s.status)
    );

    return NextResponse.json({ rto, ofd, inTransit });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
