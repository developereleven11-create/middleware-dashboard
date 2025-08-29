type RateCard = {
  base: number;
  per_kg: number;
  cod_fee: number;
  zones?: Record<string, { base: number; per_kg: number }>;
};

export function expectedCharge(weightKg: number, cod: boolean, zone: string, rate: RateCard) {
  const z = rate.zones?.[zone];
  const base = z?.base ?? rate.base;
  const per = z?.per_kg ?? rate.per_kg;
  const total = base + (per * weightKg) + (cod ? rate.cod_fee : 0);
  return Math.round(total * 100) / 100;
}
