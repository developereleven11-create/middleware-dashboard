import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get last synced timestamp from Meta table
    const lastSync = await prisma.meta.findUnique({ where: { key: "shopify_last_sync" } });
    const since = lastSync?.value || "2024-01-01T00:00:00Z"; // fallback for first run

    const url = `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2023-10/orders.json?limit=50&status=any&updated_at_min=${since}`;
    const res = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error(`Shopify API failed ${res.status}`);
    const data = await res.json();

    if (!data.orders) {
      return NextResponse.json({ ok: false, error: "No orders found" });
    }

    // Upsert into DB
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

    // Update last sync
    await prisma.meta.upsert({
      where: { key: "shopify_last_sync" },
      update: { value: new Date().toISOString() },
      create: { key: "shopify_last_sync", value: new Date().toISOString() },
    });

    return NextResponse.json({ ok: true, count: data.orders.length });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message });
  }
}
