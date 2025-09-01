import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { orderNo: string } }
) {
  try {
    const { orderNo } = params;

    // 🔹 Shopify
    const store = process.env.SHOPIFY_STORE;
    const token = process.env.SHOPIFY_ACCESS_TOKEN;

    const shopifyRes = await fetch(
      `https://${store}/admin/api/2024-07/orders.json?status=any&name=${orderNo}`,
      {
        headers: {
          "X-Shopify-Access-Token": token!,
          "Content-Type": "application/json",
        },
      }
    );

    if (!shopifyRes.ok) {
      throw new Error(`Shopify error: ${shopifyRes.status}`);
    }

    const shopifyJson = await shopifyRes.json();
    const shopifyOrder = shopifyJson.orders?.[0] ?? null;

    // 🔹 Viniculum
    const baseUrl =
      "https://pokonut.vineretail.com/RestWS/api/eretail/v1/order/shipmentDetail";
    const apiOwner = "Suraj";
    const apiKey =
      "62f9cb823fc9498780ee065d3677c865e628bfab206249c2941b038";

    const payload = {
      order_no: [orderNo],
      date_from: "",
      date_to: "",
      status: [],
      order_location: "",
      fulfillmentLocation: "",
      pageNumber: "1",
      filterBy: "2",
    };

    const viniRes = await fetch(baseUrl, {
      method: "POST",
      headers: {
        ApiOwner: apiOwner,
        Apikey: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!viniRes.ok) {
      throw new Error(`Viniculum error: ${viniRes.status}`);
    }

    const viniJson = await viniRes.json();
    const viniOrder = viniJson?.orders?.[0] ?? null;

    return NextResponse.json({
      ok: true,
      orderNumber: orderNo,
      shopify: shopifyOrder,
      viniculum: viniOrder,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
