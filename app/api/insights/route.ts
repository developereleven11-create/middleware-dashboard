import { NextResponse } from 'next/server';
export async function GET(){
  const orders=(await (await fetch(`${process.env.NEXT_PUBLIC_BASE_URL??''}/api/orders`,{cache:'no-store'})).json()).data||[];
  const shipments=(await (await fetch(`${process.env.NEXT_PUBLIC_BASE_URL??''}/api/shipments`,{cache:'no-store'})).json()).data||[];
  const rto=orders.filter((o:any)=>shipments.find((s:any)=>s.order_number===o.order_number&&s.rto));
  const ofd=orders.filter((o:any)=>shipments.find((s:any)=>s.order_number===o.order_number&&/ofd|out/i.test(s.status)));
  const inTransit=orders.filter((o:any)=>shipments.find((s:any)=>s.order_number===o.order_number&&/transit/i.test(s.status)));
  return NextResponse.json({rto,ofd,inTransit});
}
