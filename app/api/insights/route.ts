import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Helper to load mock JSON
async function loadMock(fileName: string) {
  const filePath = path.join(process.cwd(), 'public', 'data', fileName);
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

// Merge helper
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
      return shipment ? { ...o, shipment } : { ...o }; // return order even if no shipment
    })
    .filter(Boolean);
}

export async function GET() {
  try {
    const MOCK = process.env.MOCK_MODE !== 'false';

    let orders: any[] = [];
    let shipments: any[] = [];

    if (MOCK) {
      orders = await loadMock('mockOrders.json');
      shipments = await loadMock('mockShipments.json');
    } else {
      // always get Shopify orders
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

      const ordersRes = await fetch(`${baseUrl}/api/orders`, { cache: 'no-store' });
      const ordersJson = await ordersRes.json();
      orders = ordersJson.data ?? [];

      try {
        // try shipments, but if it fails, fallback to []
        const shipmentsRes = await fetch(`${baseUrl}/api/shipments`, { cache: 'no-store' });
        const shipmentsJson = await shipmentsRes.json();
        shipments = shipmentsJson.data ?? [];
      } catch {
        shipments = [];
      }
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
