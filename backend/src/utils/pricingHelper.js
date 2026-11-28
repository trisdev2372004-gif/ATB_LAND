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

export function resolveProfitPercent(ratePackage, accommodation) {
  if (ratePackage?.profitPercent !== null && ratePackage?.profitPercent !== undefined) {
    return Number(ratePackage.profitPercent);
  }
  return Number(accommodation?.pricing?.defaultProfitPercent ?? 0);
}

export function enrichRoomWithCustomerPrices(roomDoc, accommodation) {
  const obj = typeof roomDoc.toObject === 'function' ? roomDoc.toObject() : { ...roomDoc };
  obj.roomUnits = (obj.roomUnits || []).map((unit) => ({
    ...unit,
    ratePackages: (unit.ratePackages || []).map((pkg) => {
      const rate = resolveProfitPercent(pkg, accommodation);
      const baseCalc = applyProfitMarkup(pkg.price, rate);
      const extraCalc = applyProfitMarkup(pkg.extraHourPrice || 0, rate);
      return {
        ...pkg,
        effectiveProfitPercent: rate,
        customerPrice: baseCalc.customerPrice,
        customerExtraHourPrice: extraCalc.customerPrice,
      };
    }),
  }));
  return obj;
}