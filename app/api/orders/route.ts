import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Fetch orders from Shopify → Save into DB → Return response
export async function GET() {
  try {
    // Call Shopify API
    const res = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2023-07/orders.json?status=any&limit=50`,
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_API_KEY!,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Shopify API error: ${res.statusText}`);
    }

    const data = await res.json();

    // Save or update orders in DB
    for (const o of data.orders) {
      await prisma.order.upsert({
        where: { orderNumber: String(o.order_number) },
        update: {
          totalPrice: parseFloat(o.total_price),
          financialStatus: o.financial_status,
          fulfillmentStatus: o.fulfillment_status,
          rawData: o, // ✅ fixed
          provider: "shopify",
        },
        create: {
          id: String(o.id),
          orderNumber: String(o.order_number),
          createdAt: new Date(o.created_at),
          totalPrice: parseFloat(o.total_price),
          financialStatus: o.financial_status,
          fulfillmentStatus: o.fulfillment_status,
          rawData: o, // ✅ fixed
          provider: "shopify",
        },
      });
    }

    return NextResponse.json({ ok: true, count: data.orders.length });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
