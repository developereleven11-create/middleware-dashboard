import { NextResponse } from 'next/server';
export async function GET(){
  const MOCK=process.env.MOCK_MODE!=='false';
  if(MOCK){
    const data=(await import('@/data/mockShipments.json')).default;
    return NextResponse.json({ok:true,data});
  }
  return NextResponse.json({ok:false,error:'Shipment provider not wired yet'},{status:500});
}
