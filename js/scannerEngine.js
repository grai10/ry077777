/**
 * Webull Momentum Screener Engine
 * Provides multi-criteria preset scanners, custom filtering, and Webull Watchlist export.
 */

class ScannerEngine {
  constructor() {
    this.currentPreset = "all";
    this.customFilters = {
      minPrice: 1.0,
      maxPrice: 200.0,
      minRVol: 1.5,
      minGap: 0,
      maxFloat: 500, // in Millions
      searchQuery: ""
    };
  }

  setPreset(preset) {
    this.currentPreset = preset;
  }

  setFilter(key, value) {
    this.customFilters[key] = value;
  }

  filterStocks(stocks) {
    return stocks.filter(stock => {
      // 1. Search Query Filter
      if (this.customFilters.searchQuery) {
        const query = this.customFilters.searchQuery.toUpperCase();
        const matchesTicker = stock.ticker.toUpperCase().includes(query);
        const matchesName = stock.name.toUpperCase().includes(query);
        const matchesSector = stock.sector.toUpperCase().includes(query);
        if (!matchesTicker && !matchesName && !matchesSector) return false;
      }

      // 2. Preset Criteria
      if (this.currentPreset === "premarket") {
        if ((stock.preMarketGap || 0) < 5 || stock.rvol < 2.0) return false;
      } else if (this.currentPreset === "breakout") {
        if (stock.rvol < 2.2 || stock.changePercent < 7) return false;
      } else if (this.currentPreset === "lowfloat") {
        if (stock.float > 30 || stock.changePercent < 10) return false;
      } else if (this.currentPreset === "pullback") {
        if (stock.pattern.includes("Pullback") || stock.pattern.includes("VWAP")) return true;
        return stock.changePercent > 5 && stock.changePercent < 25;
      } else if (this.currentPreset === "supermomentum") {
        if (stock.changePercent < 15 || stock.rvol < 2.5) return false;
      } else if (this.currentPreset === "penny") {
        if (stock.price > 5.0 || stock.price < 0.5) return false;
      }

      // 3. Custom Sliders / Bounds
      if (stock.price < this.customFilters.minPrice) return false;
      if (stock.price > this.customFilters.maxPrice) return false;
      if (stock.rvol < this.customFilters.minRVol) return false;
      if (stock.changePercent < this.customFilters.minGap) return false;
      if (stock.float > this.customFilters.maxFloat) return false;

      return true;
    });
  }

  /**
   * Export tickers in Webull-ready formats
   */
  exportToWebull(stocks, format = "comma") {
    const tickers = stocks.map(s => s.ticker.toUpperCase());
    
    if (format === "comma") {
      return tickers.join(",");
    } else if (format === "newline") {
      return tickers.join("\n");
    } else if (format === "csv") {
      let csv = "Symbol,Name,Price,Change%,RVol,Float(M),Catalyst\n";
      stocks.forEach(s => {
        csv += `"${s.ticker}","${s.name}",${s.price},${s.changePercent}%,${s.rvol}x,${s.float}M,"${s.catalyst.replace(/"/g, '""')}"\n`;
      });
      return csv;
    }
    return tickers.join(",");
  }
}

window.scannerEngine = new ScannerEngine();
