/**
 * Webull Momentum Signal & Trade Plan Engine
 * Calculates exact Entry Triggers, Stop Loss (SL), Multi-tier Take Profit (TP1/TP2/TP3),
 * Risk-to-Reward Ratio (R:R), Strategy Playbook, and AI Action Verdicts.
 */

class SignalEngine {
  /**
   * Evaluate a stock and generate an end-to-end Trade Plan
   */
  generateTradePlan(stock, candles) {
    if (!candles || candles.length === 0) {
      candles = window.dataEngine.getCandles(stock.ticker);
    }

    const currentPrice = stock.price;
    const atr = window.technicalEngine.calculateATR(candles) || stock.atr || 0.50;
    const sr = window.technicalEngine.calculateSupportResistance(candles, stock);
    const ema9 = window.technicalEngine.calculateEMA(candles, 9);
    const ema21 = window.technicalEngine.calculateEMA(candles, 21);
    const rsiList = window.technicalEngine.calculateRSI(candles, 14);
    const currentRSI = rsiList.length > 0 ? rsiList[rsiList.length - 1] : 62;
    const lastEMA9 = ema9.length > 0 ? ema9[ema9.length - 1] : currentPrice * 0.98;
    const lastEMA21 = ema21.length > 0 ? ema21[ema21.length - 1] : currentPrice * 0.95;
    const lastCandle = candles[candles.length - 1];
    const vwap = lastCandle.vwap || currentPrice * 0.97;

    // Detect primary pattern & strategy setup
    let strategyName = "Breakout Momentum";
    let strategyDesc = "ซื้อตามแรงเบรคทะลุแนวต้านสำคัญ พร้อม Volume สนับสนุน";
    let entryType = "BREAKOUT";
    let entryPrice = currentPrice;
    let stopLoss = 0;
    let tp1 = 0;
    let tp2 = 0;
    let tp3 = 0;
    const reasons = [];

    // Evaluate Setup Conditions
    const isAboveVWAP = currentPrice > vwap;
    const isAboveEMA9 = currentPrice > lastEMA9;
    const isHighRVol = stock.rvol >= 2.0;
    const isLowFloat = stock.float <= 30; // under 30M shares

    if (isLowFloat && isHighRVol && stock.changePercent > 15) {
      strategyName = "⚡ Super Low Float Squeeze";
      strategyDesc = "หุ้น Float ต่ำมาก (< 30M) + วอลุ่มทะลัก โอกาสวิ่งแรงแบบ Multi-bagger";
      entryType = "MOMENTUM_RUNNER";
      entryPrice = parseFloat((currentPrice * 1.005).toFixed(2));
      stopLoss = parseFloat(Math.max(lastEMA9 * 0.98, currentPrice - (atr * 1.2)).toFixed(2));
      reasons.push(`Float ต่ำมากเพียง ${stock.float}M หุ้น ขับเคลื่อนด้วยแรงซื้อหนาแน่น`);
      reasons.push(`RVol พุ่งสูง ${stock.rvol}x เท่าของค่าเฉลี่ย`);
    } else if (currentPrice >= sr.recentResistance * 0.99) {
      strategyName = "💥 Resistance Breakout & Go";
      strategyDesc = "จ่อเบรค High of Day หรือแนวต้าน $ " + sr.recentResistance + " เข้าเมื่อทะลุ";
      entryType = "BREAKOUT_BUY";
      entryPrice = parseFloat((Math.max(currentPrice, sr.recentResistance) + 0.02).toFixed(2));
      stopLoss = parseFloat((sr.recentResistance - (atr * 0.8)).toFixed(2));
      reasons.push(`ทดสอบแนวต้าน $${sr.recentResistance} หากผ่านได้จะเกิด Short Covering`);
      reasons.push(`โมเมนตัมกราฟยืนเหนือ EMA 9 (${lastEMA9}) อย่างแข็งแกร่ง`);
    } else if (Math.abs(currentPrice - vwap) / currentPrice < 0.02 && isAboveVWAP) {
      strategyName = "🔄 VWAP Dip & Rip Bounce";
      strategyDesc = "ย่อลงมาแตะแนวรับเส้น VWAP แล้วไม่หลุด เป็นจุดเข้าที่เสี่ยงต่ำสุด (Low Risk Entry)";
      entryType = "PULLBACK_BUY";
      entryPrice = parseFloat(currentPrice.toFixed(2));
      stopLoss = parseFloat((vwap - (atr * 0.5)).toFixed(2));
      reasons.push(`ราคาย่อทดสอบ VWAP ($${vwap}) แล้วเกิดแท่งเทียน Bullish Reversal`);
      reasons.push(`จุดตัดขาดทุน (SL) ชัดเจนและแคบมาก วางใต้เส้น VWAP เล็กน้อย`);
    } else {
      strategyName = "📈 EMA 9 Trend Ride";
      strategyDesc = "เกาะเทรนด์ขาขึ้นเหนือ EMA 9 และ EMA 21";
      entryType = "TREND_BUY";
      entryPrice = parseFloat(currentPrice.toFixed(2));
      stopLoss = parseFloat((Math.min(lastEMA9, lastEMA21) - (atr * 0.7)).toFixed(2));
      reasons.push(`โครงสร้างราคายก Low - ยก High เป็นขาขึ้นสมบูรณ์`);
      reasons.push(`RSI อยู่ในโซน Bullish (${currentRSI})`);
    }

    // Safety checks for SL (ensuring SL is strictly below Entry)
    if (stopLoss >= entryPrice) {
      stopLoss = parseFloat((entryPrice - Math.max(0.05, atr * 0.9)).toFixed(2));
    }
    const riskPerShare = parseFloat((entryPrice - stopLoss).toFixed(2));
    const riskPercent = parseFloat(((riskPerShare / entryPrice) * 100).toFixed(2));

    // Calculate Multi-Tier Take Profit (TP1, TP2, TP3)
    // TP1: ~1.5R (Lock early gains)
    // TP2: ~2.5R to 3.0R (Resistance target)
    // TP3: ~4.0R+ (Runner target)
    tp1 = parseFloat((entryPrice + riskPerShare * 1.5).toFixed(2));
    tp2 = parseFloat((entryPrice + riskPerShare * 2.8).toFixed(2));
    tp3 = parseFloat((entryPrice + riskPerShare * 4.5).toFixed(2));

    // Align with S/R levels if nearby
    if (sr.r1 > entryPrice && sr.r1 < tp2) tp1 = sr.r1;
    if (sr.r2 > tp1) tp2 = sr.r2;
    if (sr.r3 > tp2) tp3 = sr.r3;

    const rewardPerShare = parseFloat((tp2 - entryPrice).toFixed(2));
    const riskRewardRatio = (rewardPerShare / (riskPerShare || 0.01)).toFixed(2);

    // Calculate Momentum Score (0 - 100)
    let score = 40;
    if (stock.changePercent > 5) score += 15;
    if (stock.changePercent > 15) score += 15;
    if (stock.rvol > 2.0) score += 15;
    if (stock.rvol > 5.0) score += 10;
    if (isAboveVWAP) score += 10;
    if (isAboveEMA9) score += 10;
    if (stock.float < 20) score += 10;
    if (currentRSI >= 55 && currentRSI <= 75) score += 10;
    if (score > 99) score = 99;

    // Verdict Badge
    let verdict = "BUY ON CONFIRMATION";
    let verdictClass = "badge-buy";
    let verdictIcon = "🟢";

    if (score >= 85 && riskRewardRatio >= 2.0) {
      verdict = "STRONG BUY (ซิ่งเต็มตัว)";
      verdictClass = "badge-strong-buy";
      verdictIcon = "🚀";
    } else if (score >= 70) {
      verdict = "BUY PULLBACK / BREAKOUT (น่าเข้าสะสม)";
      verdictClass = "badge-buy";
      verdictIcon = "⚡";
    } else if (currentRSI > 82) {
      verdict = "TAKE PROFIT (Overbought ควรล็อกกำไร)";
      verdictClass = "badge-tp";
      verdictIcon = "💰";
    } else if (score < 50) {
      verdict = "WAIT & SEE (รอดูความชัดเจน)";
      verdictClass = "badge-wait";
      verdictIcon = "⏳";
    }

    return {
      stock,
      strategyName,
      strategyDesc,
      entryType,
      entryPrice,
      stopLoss,
      riskPerShare,
      riskPercent,
      tp1,
      tp2,
      tp3,
      tp1Percent: parseFloat((((tp1 - entryPrice) / entryPrice) * 100).toFixed(2)),
      tp2Percent: parseFloat((((tp2 - entryPrice) / entryPrice) * 100).toFixed(2)),
      tp3Percent: parseFloat((((tp3 - entryPrice) / entryPrice) * 100).toFixed(2)),
      riskRewardRatio,
      score,
      verdict,
      verdictClass,
      verdictIcon,
      rsi: currentRSI,
      vwap,
      ema9: lastEMA9,
      ema21: lastEMA21,
      sr,
      reasons
    };
  }
}

window.signalEngine = new SignalEngine();
