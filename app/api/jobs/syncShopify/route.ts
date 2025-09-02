import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 🔹 Shopify API
    const store = process.env.SHOPIFY_STORE;
    const token = process.env.SHOPIFY_ACCESS_TOKEN;

    const shopifyRes = await fetch(
      `https://${store}/admin/api/2024-07/orders.json?status=any&limit=100`,
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
    const shopifyOrders: any[] = shopifyJson.orders ?? [];

    if (shopifyOrders.length === 0) {
      return NextResponse.json({ ok: true, message: "No Shopify orders" });
    }

    const orderNumbers = shopifyOrders.map((o) =>
      o.name?.replace("#", "")
    );

    // 🔹 Viniculum API
    const viniRes = await fetch(
      "https://pokonut.vineretail.com/RestWS/api/eretail/v1/order/shipmentDetail",
      {
        method: "POST",
        headers: {
          ApiOwner: process.env.VINICULUM_OWNER!,
          Apikey: process.env.VINICULUM_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_no: orderNumbers,
          date_from: "",
          date_to: "",
          status: [],
          order_location: "",
          fulfillmentLocation: "",
          pageNumber: "1",
          filterBy: "2",
        }),
      }
    );

    if (!viniRes.ok) {
      throw new Error(`Viniculum error: ${viniRes.status}`);
    }

    const viniJson = await viniRes.json();
    const viniOrders: any[] = viniJson?.orders ?? [];

    // 🔹 Merge + Save to DB
    for (const shopify of shopifyOrders) {
      const orderNo = shopify.name?.replace("#", "");
      const viniMatch = viniOrders.find((v) => v.order_no === orderNo);

      await prisma.order.upsert({
        where: { orderNumber: String(orderNo) },
        update: {
          totalPrice: parseFloat(shopify.total_price),
          financialStatus: shopify.financial_status,
          fulfillmentStatus: shopify.fulfillment_status,
          shopifyData: shopify,
          viniculumData: viniMatch ?? null,
        },
        create: {
          orderNumber: String(orderNo),
          createdAt: new Date(shopify.created_at),
          totalPrice: parseFloat(shopify.total_price),
          financialStatus: shopify.financial_status,
          fulfillmentStatus: shopify.fulfillment_status,
          shopifyData: shopify,
          viniculumData: viniMatch ?? null,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      count: shopifyOrders.length,
      message: "Orders synced successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
