import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ ok: true, count: orders.length, orders });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
