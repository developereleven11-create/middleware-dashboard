import { NextResponse } from 'next/server';

export async function GET() {
  const MOCK = process.env.MOCK_MODE === 'true' || process.env.MOCK_MODE === 'TRUE' || !process.env.SHOPIFY_STORE;
  try {
    if (MOCK) {
      const data = (await import('@/data/mockOrders.json')).default;
      return NextResponse.json({ ok: true, data });
    }
    const store = process.env.SHOPIFY_STORE!;
    const token = process.env.SHOPIFY_ACCESS_TOKEN!;
    const url = `https://${store}/admin/api/2024-07/orders.json?status=any&limit=100`;
    const res = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`Shopify error ${res.status}`);
    const json = await res.json();
    const data = (json.orders || []).map((o:any) => ({
      id: String(o.id),
      order_number: String(o.name || o.order_number || o.id),
      created_at: o.created_at,
      total_weight_kg: (o.total_weight || 0) / 1000,
      cod: Boolean(o.payment_gateway_names?.includes('Cash on Delivery')),
      shipping_address: { pincode: o.shipping_address?.zip || '' },
      fulfillment_status: o.fulfillment_status,
      financial_status: o.financial_status
    }));
    return NextResponse.json({ ok: true, data });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message }, { status: 500 });
  }
}
