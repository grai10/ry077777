/**
 * Webull Technical Analysis Engine
 * Calculates EMAs, VWAP, ATR, RSI, MACD, Pivot Points, Fibonacci & Dynamic S/R Levels.
 */

class TechnicalEngine {
  /**
   * Calculate Exponential Moving Average (EMA)
   */
  calculateEMA(candles, period) {
    if (candles.length < period) return [];
    const k = 2 / (period + 1);
    const emaArray = [];

    // Initial SMA for first period
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += candles[i].close;
    }
    let prevEMA = sum / period;
    emaArray[period - 1] = prevEMA;

    for (let i = period; i < candles.length; i++) {
      const currentEMA = candles[i].close * k + prevEMA * (1 - k);
      emaArray[i] = parseFloat(currentEMA.toFixed(2));
      prevEMA = currentEMA;
    }

    return emaArray;
  }

  /**
   * Calculate RSI (Relative Strength Index 14)
   */
  calculateRSI(candles, period = 14) {
    if (candles.length <= period) return [];
    const rsiArray = [];
    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const diff = candles[i].close - candles[i - 1].close;
      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsiArray[period] = parseFloat((100 - 100 / (1 + rs)).toFixed(2));

    for (let i = period + 1; i < candles.length; i++) {
      const diff = candles[i].close - candles[i - 1].close;
      const gain = diff >= 0 ? diff : 0;
      const loss = diff < 0 ? Math.abs(diff) : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsiArray[i] = parseFloat((100 - 100 / (1 + rs)).toFixed(2));
    }

    return rsiArray;
  }

  /**
   * Calculate MACD (12, 26, 9)
   */
  calculateMACD(candles) {
    const ema12 = this.calculateEMA(candles, 12);
    const ema26 = this.calculateEMA(candles, 26);
    const macdLine = [];

    for (let i = 0; i < candles.length; i++) {
      if (ema12[i] !== undefined && ema26[i] !== undefined) {
        macdLine[i] = parseFloat((ema12[i] - ema26[i]).toFixed(3));
      }
    }

    // Signal Line (9 EMA of MACD Line)
    const validMacdValues = macdLine.filter(v => v !== undefined);
    const signalLine = [];
    const histogram = [];

    if (validMacdValues.length >= 9) {
      // Approximate signal line
      let k = 2 / (9 + 1);
      let sum = 0;
      let startIndex = macdLine.findIndex(v => v !== undefined);
      
      for (let i = 0; i < 9; i++) {
        sum += macdLine[startIndex + i];
      }
      let prevSignal = sum / 9;
      signalLine[startIndex + 8] = parseFloat(prevSignal.toFixed(3));

      for (let i = startIndex + 9; i < candles.length; i++) {
        const curSignal = macdLine[i] * k + prevSignal * (1 - k);
        signalLine[i] = parseFloat(curSignal.toFixed(3));
        histogram[i] = parseFloat((macdLine[i] - curSignal).toFixed(3));
        prevSignal = curSignal;
      }
    }

    return { macdLine, signalLine, histogram };
  }

  /**
   * Calculate ATR (Average True Range)
   */
  calculateATR(candles, period = 14) {
    if (candles.length < 2) return 0.5;
    let trSum = 0;
    const len = Math.min(candles.length, period);
    
    for (let i = candles.length - len; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1] ? candles[i - 1].close : low;
      const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
      trSum += tr;
    }

    return parseFloat((trSum / len).toFixed(2));
  }

  /**
   * Calculate Support & Resistance Levels (Multi-tier: Pivot, Swings, Fibonacci)
   */
  calculateSupportResistance(candles, stock) {
    if (!candles || candles.length === 0) {
      const p = stock.price;
      return {
        r3: p * 1.25,
        r2: p * 1.15,
        r1: p * 1.08,
        pivot: p,
        s1: p * 0.94,
        s2: p * 0.88,
        s3: p * 0.80,
        fibLevels: {},
        keyLevels: []
      };
    }

    // High and Low of entire recent range
    let highestHigh = -Infinity;
    let lowestLow = Infinity;
    candles.forEach(c => {
      if (c.high > highestHigh) highestHigh = c.high;
      if (c.low < lowestLow) lowestLow = c.low;
    });

    const lastCandle = candles[candles.length - 1];
    const currentPrice = lastCandle.close;

    // Classic Pivot Points
    const pivot = parseFloat(((highestHigh + lowestLow + currentPrice) / 3).toFixed(2));
    const r1 = parseFloat((2 * pivot - lowestLow).toFixed(2));
    const s1 = parseFloat((2 * pivot - highestHigh).toFixed(2));
    const r2 = parseFloat((pivot + (highestHigh - lowestLow)).toFixed(2));
    const s2 = parseFloat((pivot - (highestHigh - lowestLow)).toFixed(2));
    const r3 = parseFloat((highestHigh + 2 * (pivot - lowestLow)).toFixed(2));
    const s3 = parseFloat((lowestLow - 2 * (highestHigh - pivot)).toFixed(2));

    // Fibonacci Retracement from recent swing
    const range = highestHigh - lowestLow;
    const fibLevels = {
      fib236: parseFloat((highestHigh - range * 0.236).toFixed(2)),
      fib382: parseFloat((highestHigh - range * 0.382).toFixed(2)),
      fib500: parseFloat((highestHigh - range * 0.500).toFixed(2)),
      fib618: parseFloat((highestHigh - range * 0.618).toFixed(2)),
      fib786: parseFloat((highestHigh - range * 0.786).toFixed(2)),
      fib1618: parseFloat((highestHigh + range * 0.618).toFixed(2))
    };

    // Find local Swing Highs and Swing Lows (Fractal peaks)
    const swingHighs = [];
    const swingLows = [];

    for (let i = 2; i < candles.length - 2; i++) {
      if (candles[i].high > candles[i - 1].high &&
          candles[i].high > candles[i - 2].high &&
          candles[i].high > candles[i + 1].high &&
          candles[i].high > candles[i + 2].high) {
        swingHighs.push(candles[i].high);
      }

      if (candles[i].low < candles[i - 1].low &&
          candles[i].low < candles[i - 2].low &&
          candles[i].low < candles[i + 1].low &&
          candles[i].low < candles[i + 2].low) {
        swingLows.push(candles[i].low);
      }
    }

    const recentResistance = swingHighs.filter(h => h > currentPrice).sort((a,b) => a - b)[0] || highestHigh;
    const recentSupport = swingLows.filter(l => l < currentPrice).sort((a,b) => b - a)[0] || lowestLow;

    return {
      pivot,
      r1: Math.max(r1, recentResistance),
      r2,
      r3: Math.max(r3, fibLevels.fib1618),
      s1: Math.min(s1, recentSupport),
      s2,
      s3,
      highestHigh,
      lowestLow,
      fibLevels,
      recentResistance,
      recentSupport
    };
  }
}

window.technicalEngine = new TechnicalEngine();
