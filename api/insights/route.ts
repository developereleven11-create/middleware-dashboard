import { NextResponse } from 'next/server';
import { zoneFromPincode, fmtIST } from '@/lib/utils';
import { expectedCharge } from '@/lib/freight';
import type { Order, Shipment, InsightBundle } from '@/lib/types';

async function loadJSON(path: string) {
  const mod = await import(path);
  return mod.default;
}

export async function GET() {
  try {
    const [ordersRes, shipmentsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/orders`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/shipments`, { cache: 'no-store' }),
    ]);
    const ordersJson = await ordersRes.json();
    const shipmentsJson = await shipmentsRes.json();
    const orders: Order[] = ordersJson.data ?? [];
    const shipments: Shipment[] = shipmentsJson.data ?? [];

    const tatConfig = await loadJSON('@/config/tat.json');
    const providerRates = {
      provider_a: await loadJSON('@/config/rates/provider_a.json')
    } as any;

    const byOrder: Record<string, Shipment> = {};
    shipments.forEach(s => { byOrder[s.order_number] = s; });

    const rto:any[] = [];
    const inTransit:any[] = [];
    const ofd:any[] = [];
    const outOfTAT:any[] = [];
    const tatBreach:any[] = [];
    const freightDiscrepancies:any[] = [];

    for (const o of orders) {
      const s = byOrder[o.order_number] || null;
      const status = s?.status ?? '';

      if (s?.rto || /rto/i.test(status)) rto.push({ ...o, shipment: s });
      else if (/out.*delivery/i.test(status)) ofd.push({ ...o, shipment: s });
      else if (/transit/i.test(status)) inTransit.push({ ...o, shipment: s });

      if (s) {
        const zone = zoneFromPincode(o.shipping_address.pincode, tatConfig.zones);
        const sla = tatConfig.slas[s.provider_id]?.[zone];
        const etaISO = sla ? (new Date(o.created_at).getTime() + (sla.max_days * 24 * 3600 * 1000)) : null;
        const etaIST = etaISO ? fmtIST(etaISO) : null;

        const now = Date.now();
        const deliveredAt = s.delivered_at ? new Date(s.delivered_at).getTime() : null;
        const breached = (deliveredAt ?? now) > (etaISO ?? Infinity);

        if (breached) {
          outOfTAT.push({ ...o, shipment: s, etaIST });
          if (s.rto) tatBreach.push({ ...o, shipment: s, etaIST });
        }

        const rate = providerRates[s.provider_id];
        if (rate) {
          const expected = expectedCharge(o.total_weight_kg, o.cod, zone, rate);
          const billed = s.charges?.total ?? 0;
          const delta = Math.round((billed - expected) * 100) / 100;
          if (Math.abs(delta) >= 1) {
            freightDiscrepancies.push({ ...o, shipment: s, expectedCharge: expected, delta });
          }
        }
      }
    }

    const payload: InsightBundle = {
      lastSyncIST: fmtIST(Date.now()),
      rto, inTransit, ofd, outOfTAT, tatBreach, freightDiscrepancies
    };

    return NextResponse.json(payload);
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e.message }, { status: 500 });
  }
}
