/**
 * Webull Momentum Screener - Data Engine & Stock Universe
 * Provides realistic high-frequency intraday & daily data for US Momentum & Penny Stocks
 * with live tick simulation, dynamic catalysts, and custom ticker analysis.
 */

const DEFAULT_STOCKS = [
  {
    ticker: "SOUN",
    name: "SoundHound AI Inc.",
    sector: "AI & Software",
    price: 7.42,
    prevClose: 6.15,
    change: 1.27,
    changePercent: 20.65,
    volume: 84520000,
    avgVolume: 18500000,
    rvol: 4.57,
    float: 245.8, // in Millions
    shortInterest: 18.4, // %
    marketCap: 2.15, // in Billions
    atr: 0.68,
    catalyst: "🔥 Q2 AI Voice Partnership with Major Automakers + Revenue Surge",
    preMarketGap: 14.8,
    pattern: "Breakout Above $7.20 Resistance",
    trend: "super-bullish"
  },
  {
    ticker: "MARA",
    name: "MARA Holdings Inc.",
    sector: "Crypto / Bitcoin Mining",
    price: 24.85,
    prevClose: 21.60,
    change: 3.25,
    changePercent: 15.05,
    volume: 62400000,
    avgVolume: 22000000,
    rvol: 2.84,
    float: 280.2,
    shortInterest: 26.8,
    marketCap: 6.95,
    atr: 2.10,
    catalyst: "🚀 Bitcoin Surges to New Highs + Hashrate Capacity Upgrade",
    preMarketGap: 8.5,
    pattern: "EMA 9 Bullish Trend Ride",
    trend: "super-bullish"
  },
  {
    ticker: "HOLO",
    name: "MicroCloud Hologram Inc.",
    sector: "Tech / Ultra Low Float",
    price: 2.85,
    prevClose: 1.95,
    change: 0.90,
    changePercent: 46.15,
    volume: 112400000,
    avgVolume: 12500000,
    rvol: 8.99,
    float: 4.8, // Super low float runner!
    shortInterest: 32.1,
    marketCap: 0.08,
    atr: 0.52,
    catalyst: "⚡ Holographic Spatial Computing Patent Grant & Short Squeeze",
    preMarketGap: 38.0,
    pattern: "Low Float Morning Gap & Go",
    trend: "super-bullish"
  },
  {
    ticker: "PLTR",
    name: "Palantir Technologies",
    sector: "AI & Defense",
    price: 58.60,
    prevClose: 54.20,
    change: 4.40,
    changePercent: 8.12,
    volume: 98400000,
    avgVolume: 45000000,
    rvol: 2.19,
    float: 2150.0,
    shortInterest: 4.2,
    marketCap: 131.2,
    atr: 2.85,
    catalyst: "🏆 $480M Defense Department AI Contract Win",
    preMarketGap: 5.2,
    pattern: "All-Time High Multi-Day Breakout",
    trend: "bullish"
  },
  {
    ticker: "TPST",
    name: "Tempest Therapeutics",
    sector: "Biotech / Oncology",
    price: 3.48,
    prevClose: 2.52,
    change: 0.96,
    changePercent: 38.10,
    volume: 48900000,
    avgVolume: 4200000,
    rvol: 11.64,
    float: 12.4,
    shortInterest: 14.5,
    marketCap: 0.07,
    atr: 0.44,
    catalyst: "💊 Positive Phase 2 Clinical Trial Results in Liver Cancer",
    preMarketGap: 42.5,
    pattern: "VWAP Dip & Rip Bounce",
    trend: "super-bullish"
  },
  {
    ticker: "IONQ",
    name: "IonQ Inc.",
    sector: "Quantum Computing",
    price: 28.30,
    prevClose: 25.10,
    change: 3.20,
    changePercent: 12.75,
    volume: 38200000,
    avgVolume: 14000000,
    rvol: 2.73,
    float: 198.5,
    shortInterest: 19.8,
    marketCap: 5.92,
    atr: 1.95,
    catalyst: "🔬 Next-Gen 64-Qubit Quantum System Commercial Milestone",
    preMarketGap: 7.9,
    pattern: "Cup & Handle Resistance Breakout",
    trend: "bullish"
  },
  {
    ticker: "BBAI",
    name: "BigBear.ai Holdings",
    sector: "AI & National Security",
    price: 3.12,
    prevClose: 2.68,
    change: 0.44,
    changePercent: 16.42,
    volume: 52100000,
    avgVolume: 16000000,
    rvol: 3.26,
    float: 165.0,
    shortInterest: 15.2,
    marketCap: 0.68,
    atr: 0.38,
    catalyst: "🤝 FAA Airport Security AI Vision Deployment Contract",
    preMarketGap: 11.2,
    pattern: "EMA 9 / VWAP Pullback Bounce",
    trend: "bullish"
  },
  {
    ticker: "SMCI",
    name: "Super Micro Computer",
    sector: "AI Hardware / Servers",
    price: 48.70,
    prevClose: 42.30,
    change: 6.40,
    changePercent: 15.13,
    volume: 76500000,
    avgVolume: 28000000,
    rvol: 2.73,
    float: 540.0,
    shortInterest: 21.4,
    marketCap: 28.5,
    atr: 4.80,
    catalyst: "📈 New Liquid Cooling Server Shipments Surge + Auditor Update",
    preMarketGap: 9.4,
    pattern: "Key Resistance $46 Breakout & Squeeze",
    trend: "super-bullish"
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    sector: "Semiconductors / AI Chips",
    price: 142.50,
    prevClose: 138.20,
    change: 4.30,
    changePercent: 3.11,
    volume: 89000000,
    avgVolume: 65000000,
    rvol: 1.37,
    float: 24200.0,
    shortInterest: 1.1,
    marketCap: 3510.0,
    atr: 5.20,
    catalyst: "🤖 Blackwell Ultra GPU Volume Shipments Ahead of Schedule",
    preMarketGap: 2.1,
    pattern: "Ascending Triangle Breakout",
    trend: "bullish"
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    sector: "EV / Autonomous AI",
    price: 345.80,
    prevClose: 326.50,
    change: 19.30,
    changePercent: 5.91,
    volume: 115000000,
    avgVolume: 72000000,
    rvol: 1.60,
    float: 2680.0,
    shortInterest: 3.4,
    marketCap: 1110.0,
    atr: 16.50,
    catalyst: "🚗 FSD v13 Full Unsupervised Rollout Approval in Multiple States",
    preMarketGap: 4.8,
    pattern: "Psychological $340 Level Breakout",
    trend: "bullish"
  },
  {
    ticker: "TBLT",
    name: "ToughBuilt Industries",
    sector: "Consumer / Ultra Low Float",
    price: 4.15,
    prevClose: 2.70,
    change: 1.45,
    changePercent: 53.70,
    volume: 88900000,
    avgVolume: 5100000,
    rvol: 17.43,
    float: 3.2, // Ultra Low Float
    shortInterest: 29.3,
    marketCap: 0.03,
    atr: 0.85,
    catalyst: "⚡ Global Distribution Agreement with Home Depot & Lowe's",
    preMarketGap: 62.0,
    pattern: "Super Low Float Volume Spike",
    trend: "super-bullish"
  },
  {
    ticker: "GME",
    name: "GameStop Corp.",
    sector: "Meme / Retail Momentum",
    price: 27.90,
    prevClose: 24.50,
    change: 3.40,
    changePercent: 13.88,
    volume: 45200000,
    avgVolume: 12000000,
    rvol: 3.77,
    float: 275.0,
    shortInterest: 16.2,
    marketCap: 11.8,
    atr: 2.45,
    catalyst: "💥 Massive Social Sentiment Spike & Unusual Call Option Buying",
    preMarketGap: 10.4,
    pattern: "Consolidation Range Breakout",
    trend: "super-bullish"
  },
  {
    ticker: "MVIS",
    name: "MicroVision Inc.",
    sector: "LiDAR / Autonomous Tech",
    price: 1.82,
    prevClose: 1.54,
    change: 0.28,
    changePercent: 18.18,
    volume: 34500000,
    avgVolume: 8500000,
    rvol: 4.06,
    float: 195.0,
    shortInterest: 22.5,
    marketCap: 0.39,
    atr: 0.22,
    catalyst: "📡 Automotive OEM LiDAR Validation Milestone Reached",
    preMarketGap: 12.0,
    pattern: "Penny Stock Breakout Over $1.75",
    trend: "bullish"
  },
  {
    ticker: "RIVN",
    name: "Rivian Automotive",
    sector: "EV / Clean Tech",
    price: 13.40,
    prevClose: 12.10,
    change: 1.30,
    changePercent: 10.74,
    volume: 58000000,
    avgVolume: 28000000,
    rvol: 2.07,
    float: 820.0,
    shortInterest: 14.8,
    marketCap: 13.5,
    atr: 1.15,
    catalyst: "🔋 Volkswagen Joint Venture Finalized with $5.8B Capital Injection",
    preMarketGap: 6.8,
    pattern: "Bottom Reversal & Resistance Breakout",
    trend: "bullish"
  },
  {
    ticker: "ASTS",
    name: "AST SpaceMobile",
    sector: "Space / Telecom Satellites",
    price: 32.60,
    prevClose: 28.40,
    change: 4.20,
    changePercent: 14.79,
    volume: 42100000,
    avgVolume: 16500000,
    rvol: 2.55,
    float: 145.0,
    shortInterest: 24.3,
    marketCap: 8.8,
    atr: 2.70,
    catalyst: "🛰️ FCC Approval for 5G Cellular Satellite Constellation",
    preMarketGap: 8.2,
    pattern: "Multi-Week High Breakout",
    trend: "super-bullish"
  }
];

class DataEngine {
  constructor() {
    this.stocks = JSON.parse(JSON.stringify(DEFAULT_STOCKS));
    this.activeTicker = "SOUN";
    this.listeners = [];
    this.timeframe = "5m"; // '1m', '5m', '15m', '1D'
    this.chartDataCache = {};
    this.isLive = true;
    this.simulationInterval = null;
    this.startSimulation();
  }

  getStocks() {
    return this.stocks;
  }

  getStock(ticker) {
    return this.stocks.find(s => s.ticker.toUpperCase() === ticker.toUpperCase()) || this.generateStockProfile(ticker);
  }

  generateStockProfile(ticker) {
    const sym = ticker.toUpperCase();
    const mockPrice = (Math.random() * 40 + 2).toFixed(2) * 1;
    const changePct = ((Math.random() * 35) + 3).toFixed(2) * 1;
    const prevClose = (mockPrice / (1 + changePct / 100)).toFixed(2) * 1;
    const change = (mockPrice - prevClose).toFixed(2) * 1;
    const vol = Math.floor(Math.random() * 50000000 + 10000000);
    const avgVol = Math.floor(vol / (Math.random() * 4 + 1.5));
    const rvol = (vol / avgVol).toFixed(2) * 1;
    const flt = (Math.random() * 80 + 5).toFixed(1) * 1;
    const atr = (mockPrice * (Math.random() * 0.08 + 0.04)).toFixed(2) * 1;

    const newStock = {
      ticker: sym,
      name: `${sym} Technologies Corp.`,
      sector: "Momentum / US Market",
      price: mockPrice,
      prevClose: prevClose,
      change: change,
      changePercent: changePct,
      volume: vol,
      avgVolume: avgVol,
      rvol: rvol,
      float: flt,
      shortInterest: (Math.random() * 25 + 5).toFixed(1) * 1,
      marketCap: (mockPrice * flt / 1000).toFixed(2) * 1,
      atr: atr,
      catalyst: "⚡ High Volume Momentum & Breakout Alert",
      preMarketGap: (changePct * 0.8).toFixed(1) * 1,
      pattern: "Momentum Surge",
      trend: changePct > 15 ? "super-bullish" : "bullish"
    };

    this.stocks.unshift(newStock);
    return newStock;
  }

  /**
   * Generate realistic Candlestick Data for a stock based on timeframe
   */
  getCandles(ticker, timeframe = this.timeframe, count = 80) {
    const cacheKey = `${ticker}_${timeframe}_${count}`;
    if (this.chartDataCache[cacheKey]) {
      return this.chartDataCache[cacheKey];
    }

    const stock = this.getStock(ticker);
    const currentPrice = stock.price;
    const prevClose = stock.prevClose;
    const atr = stock.atr || currentPrice * 0.06;

    const candles = [];
    const now = Date.now();
    let intervalMs = 5 * 60 * 1000;
    if (timeframe === "1m") intervalMs = 1 * 60 * 1000;
    if (timeframe === "15m") intervalMs = 15 * 60 * 1000;
    if (timeframe === "1D") intervalMs = 24 * 60 * 60 * 1000;

    // Simulate price trajectory leading up to current price
    // Create an upward momentum intraday curve
    let runningPrice = prevClose * (1 + (stock.preMarketGap || 5) / 100);
    const priceStep = (currentPrice - runningPrice) / count;

    let cumulativeVol = 0;
    let cumulativeVolPrice = 0;

    for (let i = count; i >= 0; i--) {
      const time = new Date(now - i * intervalMs);
      const volatility = (atr / Math.sqrt(count)) * (0.8 + Math.random() * 0.8);
      const trendBias = priceStep + (Math.random() - 0.45) * volatility;
      
      const open = i === count ? runningPrice : candles[candles.length - 1].close;
      let close = open + trendBias;
      
      // On the very last candle, lock to current price
      if (i === 0) {
        close = currentPrice;
      }

      const high = Math.max(open, close) + Math.random() * volatility * 0.8;
      const low = Math.min(open, close) - Math.random() * volatility * 0.8;
      const candleVol = Math.floor((stock.volume / count) * (0.5 + Math.random() * 1.5));

      cumulativeVol += candleVol;
      cumulativeVolPrice += ((high + low + close) / 3) * candleVol;
      const vwap = cumulativeVolPrice / cumulativeVol;

      candles.push({
        time: time,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: candleVol,
        vwap: parseFloat(vwap.toFixed(2))
      });

      runningPrice = close;
    }

    this.chartDataCache[cacheKey] = candles;
    return candles;
  }

  /**
   * Start live market simulation (ticks and volume pulses)
   */
  startSimulation() {
    if (this.simulationInterval) clearInterval(this.simulationInterval);
    this.simulationInterval = setInterval(() => {
      if (!this.isLive) return;

      // Pick 2-4 random stocks to update price slightly
      const countToUpdate = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < countToUpdate; i++) {
        const randomIndex = Math.floor(Math.random() * this.stocks.length);
        const stock = this.stocks[randomIndex];
        
        // Random micro tick with upward momentum bias
        const tickMove = (Math.random() - 0.46) * (stock.atr * 0.05);
        stock.price = Math.max(0.1, parseFloat((stock.price + tickMove).toFixed(2)));
        stock.change = parseFloat((stock.price - stock.prevClose).toFixed(2));
        stock.changePercent = parseFloat(((stock.change / stock.prevClose) * 100).toFixed(2));
        stock.volume += Math.floor(Math.random() * 25000 + 5000);
        stock.rvol = parseFloat((stock.volume / stock.avgVolume).toFixed(2));

        // Invalidate chart cache for this stock
        Object.keys(this.chartDataCache).forEach(k => {
          if (k.startsWith(stock.ticker)) delete this.chartDataCache[k];
        });
      }

      this.notifyListeners();
    }, 2500);
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.stocks));
  }
}

// Global Export
window.dataEngine = new DataEngine();
