/**
 * Amazon fee calculations — preserved verbatim from server.js v3
 */

function amazonFees(sellPrice, weightKg = 0.5) {
  const referral = sellPrice < 1000 ? 0 : parseFloat((sellPrice * 0.10).toFixed(2));
  const closing  = 30;
  const pickPack = 14;
  let weightFee;
  if      (weightKg <= 0.5) weightFee = 44;
  else if (weightKg <= 1.0) weightFee = 58;
  else if (weightKg <= 2.0) weightFee = 90;
  else                      weightFee = 120 + Math.ceil((weightKg - 2) / 0.5) * 20;
  const storage = 6.50;
  return { referral, closing, pickPack, weightFee, storage, total: referral + closing + pickPack + weightFee + storage };
}

function calcProfit(costs) {
  const { sellPrice, cogs, packaging = 0, shipping = 0, ppc = 30, returnRate = 4, weight = 0.5 } = costs;
  const fees       = amazonFees(sellPrice, weight);
  const returnCost = parseFloat((sellPrice * (returnRate / 100)).toFixed(2));
  const gstOut     = parseFloat(((sellPrice - cogs) * 0.18 * 0.55).toFixed(2));
  const totalCost  = cogs + packaging + shipping + fees.total + ppc + returnCost + gstOut;
  const profit     = parseFloat((sellPrice - totalCost).toFixed(2));
  const margin     = parseFloat(((profit / sellPrice) * 100).toFixed(1));
  return { fees, returnCost, gstOut, totalCost, profit, margin };
}

function estimateProfitFromProduct(p) {
  const estCogs = p.price * 0.18;
  const costs = { sellPrice: p.price, cogs: estCogs, packaging: 20, shipping: 25, ppc: 30, returnRate: 4, weight: p.weight || 0.3 };
  return calcProfit(costs);
}

module.exports = {
  amazonFees,
  calcProfit,
  estimateProfitFromProduct,
};
