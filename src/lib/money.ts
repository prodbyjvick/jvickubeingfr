export function formatGBP(pence: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

export function lowestPrice(prices: number[]) {
  if (prices.length === 0) return 0;
  return Math.min(...prices);
}
