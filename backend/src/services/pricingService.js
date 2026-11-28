export function applyProfitMarkup(baseAmount, profitPercent = 0) {
  const cleanBase = Math.max(0, Number(baseAmount || 0));
  const cleanRate = Math.max(0, Math.min(100, Number(profitPercent || 0)));
  const profitAmount = Math.round((cleanBase * cleanRate) / 100);
  const customerPrice = cleanBase + profitAmount;

  return {
    baseAmount: cleanBase,
    profitPercent: cleanRate,
    profitAmount,
    customerPrice,
  };
}