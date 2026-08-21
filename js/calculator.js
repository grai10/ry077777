/**
 * Webull Risk Management & Position Size Calculator
 * Accurately calculates shares to buy based on portfolio risk tolerance,
 * preventing account blowups and maximizing risk-adjusted returns.
 */

class RiskCalculator {
  constructor() {
    this.accountCapital = 10000; // Default $10,000 portfolio
    this.riskPercent = 1.5; // Default 1.5% risk per trade
  }

  calculate({ capital, riskPct, entryPrice, stopLoss, tp1, tp2, tp3 }) {
    const accCap = parseFloat(capital) || this.accountCapital;
    const rPct = parseFloat(riskPct) || this.riskPercent;
    const entry = parseFloat(entryPrice) || 10;
    const sl = parseFloat(stopLoss) || (entry * 0.95);

    const maxRiskDollar = accCap * (rPct / 100);
    const riskPerShare = Math.max(0.01, entry - sl);
    const riskPercentOnStock = ((riskPerShare / entry) * 100);

    // Max shares allowed without exceeding risk threshold
    let shares = Math.floor(maxRiskDollar / riskPerShare);
    
    // Ensure position size does not exceed 100% of portfolio (unless on margin)
    const maxAffordableShares = Math.floor(accCap / entry);
    const isCapitalConstrained = shares > maxAffordableShares;
    const actualShares = Math.min(shares, maxAffordableShares);

    const totalPositionCost = actualShares * entry;
    const portfolioAllocationPct = ((totalPositionCost / accCap) * 100);
    const actualMaxLoss = actualShares * riskPerShare;

    // Projected Profits
    const target1 = parseFloat(tp1) || (entry + riskPerShare * 1.5);
    const target2 = parseFloat(tp2) || (entry + riskPerShare * 2.8);
    const target3 = parseFloat(tp3) || (entry + riskPerShare * 4.5);

    const profitAtTP1 = actualShares * (target1 - entry);
    const profitAtTP2 = actualShares * (target2 - entry);
    const profitAtTP3 = actualShares * (target3 - entry);

    const rrRatio = ((target2 - entry) / riskPerShare).toFixed(2);

    return {
      accountCapital: accCap,
      riskPercent: rPct,
      maxRiskDollar: parseFloat(maxRiskDollar.toFixed(2)),
      actualShares,
      totalPositionCost: parseFloat(totalPositionCost.toFixed(2)),
      portfolioAllocationPct: parseFloat(portfolioAllocationPct.toFixed(1)),
      actualMaxLoss: parseFloat(actualMaxLoss.toFixed(2)),
      riskPerShare: parseFloat(riskPerShare.toFixed(2)),
      riskPercentOnStock: parseFloat(riskPercentOnStock.toFixed(2)),
      profitAtTP1: parseFloat(profitAtTP1.toFixed(2)),
      profitAtTP2: parseFloat(profitAtTP2.toFixed(2)),
      profitAtTP3: parseFloat(profitAtTP3.toFixed(2)),
      rrRatio: parseFloat(rrRatio),
      isCapitalConstrained,
      isHighRisk: riskPercentOnStock > 10
    };
  }
}

window.riskCalculator = new RiskCalculator();
