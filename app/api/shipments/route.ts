import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { orderNumbers, pageNumber = "1" } = await req.json();

    if (!orderNumbers || !Array.isArray(orderNumbers) || orderNumbers.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Please provide { "orderNumbers": ["12345","67890"] }' },
        { status: 400 }
      );
    }

    // 🔹 Viniculum API
    const baseUrl =
      'https://pokonut.vineretail.com/RestWS/api/eretail/v1/order/shipmentDetail';
    const apiOwner = 'Suraj';
    const apiKey =
      '62f9cb823fc9498780ee065d3677c865e628bfab206249c2941b038';

    // ✅ Proper payload format
    const payload = {
      order_no: orderNumbers,   // array of order numbers
      date_from: "",
      date_to: "",
      status: [],
      order_location: "",
      fulfillmentLocation: "",
      pageNumber: pageNumber.toString(),
      filterBy: "2"
    };

    const viniRes = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        ApiOwner: apiOwner,
        Apikey: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!viniRes.ok) {
      throw new Error(`Viniculum error: ${viniRes.status}`);
    }

    const viniJson = await viniRes.json();
    const shipments = viniJson?.orders ?? [];

    return NextResponse.json({ ok: true, data: shipments });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: 500 }
    );
  }
}

// 🔹 Support GET for testing (optional, so you can call /api/shipments?order=123)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderNo = url.searchParams.get('order');

    if (!orderNo) {
      return NextResponse.json(
        { ok: false, error: 'Please provide ?order=ORDER_NUMBER' },
        { status: 400 }
      );
    }

    const baseUrl =
      'https://pokonut.vineretail.com/RestWS/api/eretail/v1/order/shipmentDetail';
    const apiOwner = 'Suraj';
    const apiKey =
      '62f9cb823fc9498780ee065d3677c865e628bfab206249c2941b038';

    const payload = {
      order_no: [orderNo],
      date_from: "",
      date_to: "",
      status: [],
      order_location: "",
      fulfillmentLocation: "",
      pageNumber: "1",
      filterBy: "2"
    };

    const viniRes = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        ApiOwner: apiOwner,
        Apikey: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!viniRes.ok) {
      throw new Error(`Viniculum error: ${viniRes.status}`);
    }

    const viniJson = await viniRes.json();
    const shipments = viniJson?.orders ?? [];

    return NextResponse.json({ ok: true, data: shipments });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: 500 }
    );
  }
}
