import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { orderNumbers } = await req.json();

    if (!orderNumbers || orderNumbers.length === 0) {
      return NextResponse.json({ ok: false, error: 'No order numbers provided' }, { status: 400 });
    }

    const baseUrl = 'https://pokonut.vineretail.com/RestWS/api/eretail/v1/order/shipmentDetail';
    const apiOwner = 'Suraj';
    const apiKey = '62f9cb823fc9498780ee065d3677c865e628bfab206249c2941b038';

    const body = { orderNumbers };

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

    const shipments = data?.orders?.map((order: any) => {
      const ship = order.shipDetail?.[0] ?? {};
      return {
        order_number: order.order_no,
        status: ship.status || order.status,
        awb: ship.tracking_number,
        transporter: ship.transporter,
        rto: /RTO/i.test(ship.status),
        charges: { total: ship.shipment_value ?? 0 },
        items: ship.items ?? [],
      };
    }) ?? [];

    return NextResponse.json({ ok: true, data: shipments });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
