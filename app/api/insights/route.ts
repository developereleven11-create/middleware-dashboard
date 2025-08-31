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
    // Construct a dummy Request object for compatibility
    const dummyReq = new Request('http://localhost');

    // call orders API directly
    const ordersRes: any = await getOrders(dummyReq);
    const ordersJson = await ordersRes.json();
    const orders: any[] = ordersJson.data ?? [];

    // call shipments API directly
    let shipments: any[] = [];
    try {
      const shipmentsRes: any = await getShipments(dummyReq);
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
