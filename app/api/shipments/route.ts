import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Viniculum API creds
    const baseUrl = 'https://pokonut.vineretail.com/RestWS/api/eretail/v1/order/shipmentDetail';
    const apiOwner = 'Suraj';
    const apiKey = '62f9cb823fc9498780ee065d3677c865e628bfab206249c2941b038';

    // ⚡ Right now fetching ALL shipment data (later we can pass specific order IDs/filters)
    const res = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'ApiOwner': apiOwner,
        'Apikey': apiKey,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Viniculum error: ${res.status}`);
    }

    const data = await res.json();

    // Normalize the response so insights can use it
    const shipments = data?.orderShipmentList?.map((s: any) => ({
      order_number: s.orderNumber,
      awb: s.awbNumber,
      status: s.shipmentStatus,
      rto: /RTO/i.test(s.shipmentStatus),
      charges: {
        total: s.freightCharge ?? 0,
      },
    })) ?? [];

    return NextResponse.json({ ok: true, data: shipments });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
