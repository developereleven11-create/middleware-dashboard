import { NextResponse } from 'next/server';
import mockOrders from '../../../data/mockOrders.json';

export async function GET() {
  const MOCK = process.env.MOCK_MODE !== 'false';

  try {
    if (MOCK) {
      return NextResponse.json({ ok: true, data: mockOrders });
    }

    const store = process.env.SHOPIFY_STORE;
    const token = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!store || !token) {
      return NextResponse.json(
        { ok: false, error: 'Missing SHOPIFY_STORE or SHOPIFY_ACCESS_TOKEN' },
        { status: 500 }
      );
    }

    const url = `https://${store}/admin/api/2024-07/orders.json?status=any&limit=50`;
    const res = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error(`Shopify error ${res.status}`);

    const json = await res.json();
    return NextResponse.json({ ok: true, data: json.orders });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
