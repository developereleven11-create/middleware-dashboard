import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Find 50 orders without viniculumStatus
    const pending = await prisma.order.findMany({
      where: { viniculumStatus: null },
      take: 50,
    });

    if (pending.length === 0) {
      return NextResponse.json({ ok: true, message: "No pending orders" });
    }

    // Call Viniculum API (dummy example - adjust body)
    const res = await fetch("https://pokonut.vineretail.com/RestWS/api/eretail/v1/order/shipmentDetail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ApiOwner: "Suraj",
        Apikey: process.env.VINICULUM_API_KEY!,
      },
      body: JSON.stringify({
        order_no: pending.map((o) => o.orderNumber),
        date_from: "",
        date_to: "",
        status: [],
        order_location: "",
        fulfillmentLocation: "",
        pageNumber: "1",
        filterBy: "2",
      }),
    });

    if (!res.ok) throw new Error(`Viniculum API failed ${res.status}`);
    const data = await res.json();

    if (data?.orderShipmentList) {
      for (const shipment of data.orderShipmentList) {
        await prisma.order.update({
          where: { orderNumber: shipment.orderNo },
          data: { viniculumStatus: shipment.shipmentStatus },
        });
      }
    }

    return NextResponse.json({ ok: true, updated: pending.length });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message });
  }
}
