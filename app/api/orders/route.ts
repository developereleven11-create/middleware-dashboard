import { NextResponse } from 'next/server';

export async function GET() {
  const MOCK = process.env.MOCK_MODE !== 'false';

  try {
    if (MOCK) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/data/mockOrders.json`);
      const data = await res.json();
      return NextResponse.json({ ok: true, data });
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
    const shopifyRes = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
    });

    if (!shopifyRes.ok) throw new Error(`Shopify error ${shopifyRes.status}`);

    const json = await shopifyRes.json();
    return NextResponse.json({ ok: true, data: json.orders });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
