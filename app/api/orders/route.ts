import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

async function loadMock(fileName: string) {
  const filePath = path.join(process.cwd(), 'public', 'data', fileName);
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

export async function GET() {
  const MOCK = process.env.MOCK_MODE !== 'false';

  try {
    if (MOCK) {
      const data = await loadMock('mockOrders.json');
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

    const url = `https://${store}/admin/api/2024-07/orders.json?status=any&limit=20`;
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
