import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const urlObj = new URL(req.url);
  const pageInfo = urlObj.searchParams.get('page_info'); // Shopify cursor
  const limit = urlObj.searchParams.get('limit') || '50'; // default 50, max 250

  try {
    const store = process.env.SHOPIFY_STORE;
    const token = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!store || !token) {
      return NextResponse.json(
        { ok: false, error: 'Missing SHOPIFY_STORE or SHOPIFY_ACCESS_TOKEN' },
        { status: 500 }
      );
    }

    let url = `https://${store}/admin/api/2024-07/orders.json?status=any&limit=${limit}`;
    if (pageInfo) url += `&page_info=${pageInfo}`;

    const res = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error(`Shopify error ${res.status}`);

    const json = await res.json();
    const linkHeader = res.headers.get('link');

    // Parse pagination links
    let nextPage: string | null = null;
    let prevPage: string | null = null;

    if (linkHeader) {
      const parts = linkHeader.split(',');
      for (const part of parts) {
        const [link, rel] = part.split(';');
        if (rel.includes('next')) {
          nextPage = new URL(link.trim().replace(/<|>/g, '')).searchParams.get('page_info');
        }
        if (rel.includes('previous')) {
          prevPage = new URL(link.trim().replace(/<|>/g, '')).searchParams.get('page_info');
        }
      }
    }

    return NextResponse.json({
      ok: true,
      data: json.orders,
      nextPage,
      prevPage,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
