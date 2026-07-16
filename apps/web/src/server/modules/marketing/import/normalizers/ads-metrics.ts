interface AdsMetricInput {
  clicks: number | null;
  conversions: number | null;
  impressions: number | null;
  purchaseValue: number | null;
  spend: number | null;
}

export interface DerivedAdsMetrics {
  costPerOrder: number | null;
  ctr: number | null;
  platformRoas: number | null;
}

function safeRatio(numerator: number | null, denominator: number | null, multiplier = 1): number | null {
  if (numerator === null || denominator === null || denominator <= 0) return null;
  return Math.round((numerator / denominator) * multiplier * 10_000) / 10_000;
}

/** Satu sumber rumus metrik turunan; database tetap hanya menyimpan metrik dasar. */
export function deriveAdsMetrics(input: AdsMetricInput): DerivedAdsMetrics {
  return {
    ctr: safeRatio(input.clicks, input.impressions, 100),
    costPerOrder: safeRatio(input.spend, input.conversions),
    platformRoas: safeRatio(input.purchaseValue, input.spend),
  };
}
