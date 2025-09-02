import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const res = await fetch("https://pokonut.myshopify.com/admin/api/2023-10/orders.json?limit=50", {
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
      },
    });
    const data = await res.json();

    if (!data.orders) {
      return NextResponse.json({ ok: false, error: "No orders found" });
    }

    for (const order of data.orders) {
      await prisma.order.upsert({
        where: { orderNumber: String(order.order_number) },
        update: {
          totalPrice: parseFloat(order.total_price),
          financialStatus: order.financial_status,
          fulfillmentStatus: order.fulfillment_status,
          rawData: order,
          provider: "shopify",
        },
        create: {
          orderNumber: String(order.order_number),
          createdAt: new Date(order.created_at),
          totalPrice: parseFloat(order.total_price),
          financialStatus: order.financial_status,
          fulfillmentStatus: order.fulfillment_status,
          rawData: order,
          provider: "shopify",
        },
      });
    }

    return NextResponse.json({ ok: true, count: data.orders.length });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message });
  }
}
