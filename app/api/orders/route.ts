import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Fetch orders from Shopify → Save into DB → Return response
export async function GET() {
  try {
    const shopifyRes = await fetch(
      "https://your-shopify-store.myshopify.com/admin/api/2023-10/orders.json?limit=50",
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!shopifyRes.ok) {
      throw new Error(`Shopify error: ${shopifyRes.status}`);
    }

    const json = await shopifyRes.json();
    const orders = json.orders || [];

    // Save each order to Neon DB
    for (const o of orders) {
      await prisma.order.upsert({
        where: { id: String(o.id) },
        update: {
          orderNumber: String(o.order_number),
          createdAt: new Date(o.created_at),
          totalPrice: parseFloat(o.total_price || "0"),
          financialStatus: o.financial_status,
          fulfillmentStatus: o.fulfillment_status,
          data: o, // store raw Shopify JSON
        },
        create: {
          id: String(o.id),
          orderNumber: String(o.order_number),
          createdAt: new Date(o.created_at),
          totalPrice: parseFloat(o.total_price || "0"),
          financialStatus: o.financial_status,
          fulfillmentStatus: o.fulfillment_status,
          data: o,
        },
      });
    }

    return NextResponse.json({ ok: true, count: orders.length, orders });
  } catch (err: any) {
    console.error("Orders API error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
