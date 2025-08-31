import { NextResponse } from 'next/server';
import { GET as getOrders } from '../orders/route';

export async function GET(req: Request) {
  try {
    const urlObj = new URL(req.url);
    const dummyReq = new Request(`http://localhost/api/orders${urlObj.search}`);

    // 1. Fetch Shopify orders
    const ordersRes: any = await getOrders(dummyReq);
    const ordersJson = await ordersRes.json();
    const orders: any[] = ordersJson.data ?? [];

    // 2. Collect order numbers
    const orderNumbers = orders.map((o) => o.order_number);

    // 3. Call Viniculum shipments for these orders
    let shipments: any[] = [];
    try {
      const shipmentsRes = await fetch(`${urlObj.origin}/api/shipments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumbers }),
      });
      const shipmentsJson = await shipmentsRes.json();
      shipments = shipmentsJson.data ?? [];
    } catch {
      shipments = [];
    }

    // 4. Merge
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
