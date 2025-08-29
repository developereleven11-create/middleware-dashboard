import { formatInTimeZone } from "date-fns-tz";

export const IST_TZ = "Asia/Kolkata";

export function fmtIST(iso: string | number | Date, pattern = "dd MMM yyyy, HH:mm") {
  const d = new Date(iso);
  return formatInTimeZone(d, IST_TZ, pattern);
}

export function zoneFromPincode(pincode: string, zonesConfig: {name:string,pincodes:string[]}[]) {
  const prefix = pincode?.slice(0,3) ?? "";
  for (const z of zonesConfig) {
    if (z.pincodes.includes(prefix)) return z.name;
  }
  return "Rest";
}
