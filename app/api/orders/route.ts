import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count(),
    ]);

    return NextResponse.json({
      ok: true,
      page,
      totalPages: Math.ceil(total / limit),
      orders,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message });
  }
}
