import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const baseUrl = 'https://pokonut.vineretail.com/RestWS/api/eretail/v1/order/shipmentDetail';
    const apiOwner = 'Suraj';
    const apiKey = '62f9cb823fc9498780ee065d3677c865e628bfab206249c2941b038';

    const body = {
      fromDate: "2025-08-01",  // adjust date range
      toDate: "2025-08-31"
    };

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'ApiOwner': apiOwner,
        'Apikey': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Viniculum error: ${res.status}`);
    }

    const data = await res.json();

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
