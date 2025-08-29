export type Order = {
  id: string;
  order_number: string;
  created_at: string;
  total_weight_kg: number;
  cod: boolean;
  shipping_address: { pincode: string };
  fulfillment_status: string | null;
  financial_status: string | null;
};

export type Shipment = {
  provider_id: string;
  order_number: string;
  awb: string;
  status: "In Transit" | "Out for Delivery" | "Delivered" | "RTO" | string;
  events: { ts: string; desc: string }[];
  etd: string | null;
  delivered_at: string | null;
  rto: boolean;
  charges: { base: number; per_kg: number; cod_fee: number; total: number };
};

export type InsightBundle = {
  lastSyncIST: string;
  rto: (Order & { shipment: Shipment | null })[];
  inTransit: (Order & { shipment: Shipment | null })[];
  ofd: (Order & { shipment: Shipment | null })[];
  outOfTAT: (Order & { shipment: Shipment | null; etaIST: string | null })[];
  tatBreach: (Order & { shipment: Shipment | null; etaIST: string | null })[];
  freightDiscrepancies: (Order & { shipment: Shipment | null; expectedCharge: number; delta: number })[];
};
