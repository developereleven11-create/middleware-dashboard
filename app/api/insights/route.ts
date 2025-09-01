import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "20");

    // 🔹 Shopify API
    const store = process.env.SHOPIFY_STORE;
    const token = process.env.SHOPIFY_ACCESS_TOKEN;

    const shopifyRes = await fetch(
      `https://${store}/admin/api/2024-07/orders.json?status=any&limit=${limit}`,
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
    const orders: any[] = shopifyJson.orders ?? [];

    if (orders.length === 0) {
      return NextResponse.json({ ok: true, data: [] });
    }

    // Extract order numbers
    const orderNumbers = orders.map((o) => o.name?.replace("#", ""));

    // 🔹 Viniculum API
    const baseUrl =
      "https://pokonut.vineretail.com/RestWS/api/eretail/v1/order/shipmentDetail";
    const apiOwner = "Suraj";
    const apiKey =
      "62f9cb823fc9498780ee065d3677c865e628bfab206249c2941b038";

    const payload = {
      order_no: orderNumbers,
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
    const viniOrders: any[] = viniJson?.orders ?? [];

    // 🔹 Merge Shopify + Viniculum
    const merged = orders.map((shopifyOrder) => {
      const orderNo = shopifyOrder.name?.replace("#", "");
      const viniMatch = viniOrders.find((v) => v.order_no === orderNo);

      return {
        id: shopifyOrder.id,
        order_number: orderNo,
        created_at: shopifyOrder.created_at,
        total_price: shopifyOrder.total_price,
        financial_status: shopifyOrder.financial_status,
        fulfillment_status: shopifyOrder.fulfillment_status,
        line_items: shopifyOrder.line_items.map((li: any) => ({
          title: li.title,
          quantity: li.quantity,
          price: li.price,
          sku: li.sku,
        })),
        viniculum: viniMatch ?? null,
      };
    });

    return NextResponse.json({ ok: true, data: merged });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
