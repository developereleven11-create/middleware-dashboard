import { NextResponse } from 'next/server';
import { GET as getOrders } from '../orders/route';
import { GET as getShipments } from '../shipments/route';

export async function GET(req: Request) {
  try {
    // forward pagination query params
    const urlObj = new URL(req.url);
    const dummyReq = new Request(`http://localhost/api/orders${urlObj.search}`);

    // Fetch Shopify orders
    const ordersRes: any = await getOrders(dummyReq);
    const ordersJson = await ordersRes.json();
    const orders: any[] = ordersJson.data ?? [];

    // Fetch Viniculum shipments
    let shipments: any[] = [];
    try {
      const shipmentsRes: any = await getShipments();
      const shipmentsJson = await shipmentsRes.json();
      shipments = shipmentsJson.data ?? [];
    } catch {
      shipments = [];
    }

    // Merge: keep full Shopify order, attach shipment if exists
    const merged = orders.map((o) => {
      const shipment = shipments.find((s: any) => s.order_number == o.order_number);
      return shipment ? { ...o, shipment } : o;
    });

    return NextResponse.json({
      ok: true,
      data: merged,
      nextPage: ordersJson.nextPage ?? null,
      prevPage: ordersJson.prevPage ?? null,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
