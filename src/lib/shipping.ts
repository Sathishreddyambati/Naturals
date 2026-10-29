export function getShippingFee(subtotalPaise: number) {
  const flatFee = Number(process.env.SHIPPING_FEE_PAISE ?? 4900);
  const freeThreshold = Number(process.env.FREE_SHIPPING_THRESHOLD_PAISE ?? 99900);
  if (subtotalPaise >= freeThreshold) return 0;
  return flatFee;
}

export function getFreeShippingThreshold() {
  return Number(process.env.FREE_SHIPPING_THRESHOLD_PAISE ?? 99900);
}
