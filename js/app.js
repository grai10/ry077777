/**
 * Webull Momentum Screener & Trading Terminal - Main Application Controller
 * Connects DataEngine, ScannerEngine, SignalEngine, TechnicalEngine, ChartEngine, and RiskCalculator.
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Components
  let chart = null;
  let currentStock = null;
  let currentTradePlan = null;

  try {
    chart = new window.ChartEngine("stockChart");
  } catch (e) {
    console.error("Failed to initialize ChartEngine", e);
  }

  // 2. DOM Elements
  const tickerTapeTrack = document.getElementById("tickerTapeTrack");
  const stockListEl = document.getElementById("stockList");
  const searchInput = document.getElementById("searchInput");
  const presetBtns = document.querySelectorAll(".preset-btn");
  
  // Hero Stats Elements
  const heroSymbol = document.getElementById("heroSymbol");
  const heroName = document.getElementById("heroName");
  const heroPrice = document.getElementById("heroPrice");
  const heroChange = document.getElementById("heroChange");
  const heroRvol = document.getElementById("heroRvol");
  const heroFloat = document.getElementById("heroFloat");
  const heroAtr = document.getElementById("heroAtr");
  const heroVerdict = document.getElementById("heroVerdict");
  const heroCatalyst = document.getElementById("heroCatalyst");

  // Trade Plan Elements
  const planStrategyName = document.getElementById("planStrategyName");
  const planEntryPrice = document.getElementById("planEntryPrice");
  const planStopLoss = document.getElementById("planStopLoss");
  const planRiskPct = document.getElementById("planRiskPct");
  const planTp1 = document.getElementById("planTp1");
  const planTp1Pct = document.getElementById("planTp1Pct");
  const planTp2 = document.getElementById("planTp2");
  const planTp2Pct = document.getElementById("planTp2Pct");
  const planTp3 = document.getElementById("planTp3");
  const planTp3Pct = document.getElementById("planTp3Pct");
  const planRrRatio = document.getElementById("planRrRatio");
  const planScore = document.getElementById("planScore");
  const planReasonsList = document.getElementById("planReasonsList");

  // Support / Resistance summary elements
  const srPivot = document.getElementById("srPivot");
  const srR1 = document.getElementById("srR1");
  const srR2 = document.getElementById("srR2");
  const srS1 = document.getElementById("srS1");
  const srS2 = document.getElementById("srS2");

  // Calculator Elements
  const calcCapitalInput = document.getElementById("calcCapital");
  const calcRiskPctInput = document.getElementById("calcRiskPct");
  const calcShares = document.getElementById("calcShares");
  const calcPositionCost = document.getElementById("calcPositionCost");
  const calcAllocation = document.getElementById("calcAllocation");
  const calcMaxLoss = document.getElementById("calcMaxLoss");
  const calcProfitTp1 = document.getElementById("calcProfitTp1");
  const calcProfitTp2 = document.getElementById("calcProfitTp2");
  const calcProfitTp3 = document.getElementById("calcProfitTp3");
  const calcRrVal = document.getElementById("calcRrVal");

  // Filter Sliders
  const sliderPrice = document.getElementById("sliderPrice");
  const sliderPriceVal = document.getElementById("sliderPriceVal");
  const sliderRvol = document.getElementById("sliderRvol");
  const sliderRvolVal = document.getElementById("sliderRvolVal");
  const sliderFloat = document.getElementById("sliderFloat");
  const sliderFloatVal = document.getElementById("sliderFloatVal");

  // Timeframe Buttons & Indicator Toggles
  const tfBtns = document.querySelectorAll(".tf-btn");
  const indToggles = document.querySelectorAll(".ind-toggle");

  // Export Modal Elements
  const exportBtn = document.getElementById("exportBtn");
  const exportModal = document.getElementById("exportModal");
  const modalClose = document.getElementById("modalClose");
  const exportTextarea = document.getElementById("exportTextarea");
  const copyExportBtn = document.getElementById("copyExportBtn");
  const exportFormatBtns = document.querySelectorAll(".format-tab");

  // Toast Notification
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMsg");

  function showToast(msg) {
    if (!toast) return;
    toastMsg.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2800);
  }

  // 3. Render Top Ticker Tape
  function renderTickerTape() {
    if (!tickerTapeTrack) return;
    const stocks = window.dataEngine.getStocks();
    let html = "";
    // Duplicate list for continuous marquee looping
    const displayList = [...stocks, ...stocks];
    displayList.forEach(s => {
      const isUp = s.change >= 0;
      html += `
        <div class="tape-item" data-ticker="${s.ticker}">
          <span class="tape-symbol">${s.ticker}</span>
          <span class="tape-price">$${s.price.toFixed(2)}</span>
          <span class="tape-change ${isUp ? 'up' : 'down'}">${isUp ? '+' : ''}${s.changePercent.toFixed(2)}%</span>
        </div>
      `;
    });
    tickerTapeTrack.innerHTML = html;

    // Click on ticker tape to select stock
    tickerTapeTrack.querySelectorAll(".tape-item").forEach(item => {
      item.addEventListener("click", () => {
        const sym = item.getAttribute("data-ticker");
        selectStock(sym);
      });
    });
  }

  // 4. Render Stock Screener List
  function renderStockList() {
    if (!stockListEl) return;
    const filtered = window.scannerEngine.filterStocks(window.dataEngine.getStocks());
    
    if (filtered.length === 0) {
      stockListEl.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          🔍 ไม่พบหุ้นตามเงื่อนไขที่กำหนด ลองปรับฟิลเตอร์ใหม่อีกครั้ง
        </div>
      `;
      return;
    }

    let html = "";
    filtered.forEach(s => {
      const isUp = s.change >= 0;
      const isActive = currentStock && currentStock.ticker === s.ticker;
      html += `
        <div class="stock-item ${isActive ? 'active' : ''}" data-ticker="${s.ticker}">
          <div class="stock-main-info">
            <div class="stock-symbol">
              ${s.ticker}
              ${s.float <= 25 ? `<span class="float-badge">Float ${s.float}M</span>` : ''}
            </div>
            <div class="stock-meta">${s.sector}</div>
          </div>
          <div class="stock-price-info">
            <div class="stock-price">$${s.price.toFixed(2)}</div>
            <div class="stock-change ${isUp ? 'text-bullish' : 'text-bearish'}">
              ${isUp ? '+' : ''}${s.changePercent.toFixed(2)}%
            </div>
            <div class="rvol-tag">RVol ${s.rvol}x</div>
          </div>
        </div>
      `;
    });
    stockListEl.innerHTML = html;

    // Attach click handlers
    stockListEl.querySelectorAll(".stock-item").forEach(el => {
      el.addEventListener("click", () => {
        const ticker = el.getAttribute("data-ticker");
        selectStock(ticker);
      });
    });
  }

  // 5. Select Stock & Update Analysis
  function selectStock(ticker) {
    const stock = window.dataEngine.getStock(ticker);
    if (!stock) return;

    currentStock = stock;
    window.dataEngine.activeTicker = stock.ticker;

    // Update Screener Active State
    if (stockListEl) {
      stockListEl.querySelectorAll(".stock-item").forEach(item => {
        if (item.getAttribute("data-ticker") === stock.ticker) item.classList.add("active");
        else item.classList.remove("active");
      });
    }

    // Fetch Candles & Generate Trade Plan
    const candles = window.dataEngine.getCandles(stock.ticker);
    currentTradePlan = window.signalEngine.generateTradePlan(stock, candles);

    // Update Hero Card
    if (heroSymbol) heroSymbol.textContent = stock.ticker;
    if (heroName) heroName.textContent = `${stock.name} • ${stock.sector}`;
    if (heroPrice) heroPrice.textContent = `$${stock.price.toFixed(2)}`;
    
    if (heroChange) {
      const isUp = stock.change >= 0;
      heroChange.className = `hero-change-badge ${isUp ? 'up' : 'down'}`;
      heroChange.innerHTML = `${isUp ? '▲' : '▼'} ${isUp ? '+' : ''}${stock.change.toFixed(2)} (${isUp ? '+' : ''}${stock.changePercent.toFixed(2)}%)`;
    }

    if (heroRvol) heroRvol.textContent = `${stock.rvol}x`;
    if (heroFloat) heroFloat.textContent = `${stock.float}M`;
    if (heroAtr) heroAtr.textContent = `$${stock.atr || (stock.price * 0.06).toFixed(2)}`;
    if (heroCatalyst) heroCatalyst.textContent = stock.catalyst || "โมเมนตัมกราฟเทคนิคและการซื้อขายหนาแน่น";

    if (heroVerdict && currentTradePlan) {
      heroVerdict.className = `verdict-badge ${currentTradePlan.verdictClass}`;
      heroVerdict.innerHTML = `${currentTradePlan.verdictIcon} ${currentTradePlan.verdict}`;
    }

    // Update Trade Plan Section
    if (currentTradePlan) {
      if (planStrategyName) planStrategyName.textContent = currentTradePlan.strategyName;
      if (planEntryPrice) planEntryPrice.textContent = `$${currentTradePlan.entryPrice.toFixed(2)}`;
      if (planStopLoss) planStopLoss.textContent = `$${currentTradePlan.stopLoss.toFixed(2)}`;
      if (planRiskPct) planRiskPct.textContent = `-${currentTradePlan.riskPercent}%`;
      if (planTp1) planTp1.textContent = `$${currentTradePlan.tp1.toFixed(2)}`;
      if (planTp1Pct) planTp1Pct.textContent = `+${currentTradePlan.tp1Percent}%`;
      if (planTp2) planTp2.textContent = `$${currentTradePlan.tp2.toFixed(2)}`;
      if (planTp2Pct) planTp2Pct.textContent = `+${currentTradePlan.tp2Percent}%`;
      if (planTp3) planTp3.textContent = `$${currentTradePlan.tp3.toFixed(2)}`;
      if (planTp3Pct) planTp3Pct.textContent = `+${currentTradePlan.tp3Percent}%`;
      if (planRrRatio) planRrRatio.textContent = `1 : ${currentTradePlan.riskRewardRatio}`;
      if (planScore) planScore.textContent = `${currentTradePlan.score}/100`;

      // Update Reasons
      if (planReasonsList) {
        let reasonsHtml = "";
        currentTradePlan.reasons.forEach(r => {
          reasonsHtml += `<li><span class="reason-icon">✔</span> ${r}</li>`;
        });
        reasonsHtml += `<li><span class="reason-icon">📊</span> สัญญาณแท่งเทียน: ${stock.pattern}</li>`;
        reasonsHtml += `<li><span class="reason-icon">🎯</span> กลยุทธ์: ${currentTradePlan.strategyDesc}</li>`;
        planReasonsList.innerHTML = reasonsHtml;
      }

      // Update Support & Resistance Summary
      if (srPivot && currentTradePlan.sr) {
        srPivot.textContent = `$${currentTradePlan.sr.pivot.toFixed(2)}`;
        srR1.textContent = `$${currentTradePlan.sr.r1.toFixed(2)}`;
        srR2.textContent = `$${currentTradePlan.sr.r2.toFixed(2)}`;
        srS1.textContent = `$${currentTradePlan.sr.s1.toFixed(2)}`;
        srS2.textContent = `$${currentTradePlan.sr.s2.toFixed(2)}`;
      }
    }

    // Update Chart
    if (chart) {
      chart.updateData(candles, currentTradePlan);
    }

    // Recalculate Risk Management
    updateRiskCalculator();
  }

  // 6. Update Risk Calculator Output
  function updateRiskCalculator() {
    if (!currentTradePlan) return;
    const capital = parseFloat(calcCapitalInput.value) || 10000;
    const riskPct = parseFloat(calcRiskPctInput.value) || 1.5;

    const calcResult = window.riskCalculator.calculate({
      capital,
      riskPct,
      entryPrice: currentTradePlan.entryPrice,
      stopLoss: currentTradePlan.stopLoss,
      tp1: currentTradePlan.tp1,
      tp2: currentTradePlan.tp2,
      tp3: currentTradePlan.tp3
    });

    if (calcShares) calcShares.textContent = `${calcResult.actualShares.toLocaleString()} หุ้น`;
    if (calcPositionCost) calcPositionCost.textContent = `$${calcResult.totalPositionCost.toLocaleString()}`;
    if (calcAllocation) calcAllocation.textContent = `${calcResult.portfolioAllocationPct}% ของพอร์ต`;
    if (calcMaxLoss) calcMaxLoss.textContent = `-$${calcResult.actualMaxLoss.toFixed(2)} (-${calcResult.riskPercentOnStock.toFixed(1)}%)`;
    if (calcProfitTp1) calcProfitTp1.textContent = `+$${calcResult.profitAtTP1.toFixed(2)}`;
    if (calcProfitTp2) calcProfitTp2.textContent = `+$${calcResult.profitAtTP2.toFixed(2)}`;
    if (calcProfitTp3) calcProfitTp3.textContent = `+$${calcResult.profitAtTP3.toFixed(2)}`;
    if (calcRrVal) calcRrVal.textContent = `1 : ${calcResult.rrRatio}`;
  }

  // 7. Event Listeners for Presets
  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      presetBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const preset = btn.getAttribute("data-preset");
      window.scannerEngine.setPreset(preset);
      renderStockList();
      showToast(`เปลี่ยนพรีเซ็ตตัวกรอง: ${btn.textContent.trim()}`);
    });
  });

  // 8. Search Input Handler
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.trim();
      window.scannerEngine.setFilter("searchQuery", q);
      renderStockList();
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const q = e.target.value.trim().toUpperCase();
        if (q) {
          selectStock(q);
          showToast(`วิเคราะห์หุ้น: ${q}`);
        }
      }
    });
  }

  // 9. Filter Sliders Event Handlers
  if (sliderPrice) {
    sliderPrice.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      sliderPriceVal.textContent = `$${val}`;
      window.scannerEngine.setFilter("maxPrice", val);
      renderStockList();
    });
  }

  if (sliderRvol) {
    sliderRvol.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      sliderRvolVal.textContent = `${val.toFixed(1)}x`;
      window.scannerEngine.setFilter("minRVol", val);
      renderStockList();
    });
  }

  if (sliderFloat) {
    sliderFloat.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      sliderFloatVal.textContent = `${val}M`;
      window.scannerEngine.setFilter("maxFloat", val);
      renderStockList();
    });
  }

  // 10. Timeframe Selector Event
  tfBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tfBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tf = btn.getAttribute("data-tf");
      window.dataEngine.timeframe = tf;
      if (currentStock) {
        const candles = window.dataEngine.getCandles(currentStock.ticker, tf);
        currentTradePlan = window.signalEngine.generateTradePlan(currentStock, candles);
        if (chart) chart.updateData(candles, currentTradePlan);
      }
    });
  });

  // 11. Indicator Toggles
  indToggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      const ind = toggle.getAttribute("data-ind");
      toggle.classList.toggle("active");
      const isActive = toggle.classList.contains("active");
      if (chart) {
        chart.showIndicators[ind] = isActive;
        chart.render();
      }
    });
  });

  // 12. Calculator Input Listeners
  if (calcCapitalInput) calcCapitalInput.addEventListener("input", updateRiskCalculator);
  if (calcRiskPctInput) calcRiskPctInput.addEventListener("input", updateRiskCalculator);

  // 13. Export to Webull Modal Handling
  let currentExportFormat = "comma";
  function updateExportText() {
    const filtered = window.scannerEngine.filterStocks(window.dataEngine.getStocks());
    const exportString = window.scannerEngine.exportToWebull(filtered, currentExportFormat);
    if (exportTextarea) exportTextarea.value = exportString;
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      updateExportText();
      if (exportModal) exportModal.classList.add("active");
    });
  }

  if (modalClose) {
    modalClose.addEventListener("click", () => {
      if (exportModal) exportModal.classList.remove("active");
    });
  }

  exportFormatBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      exportFormatBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentExportFormat = btn.getAttribute("data-format");
      updateExportText();
    });
  });

  if (copyExportBtn) {
    copyExportBtn.addEventListener("click", () => {
      if (exportTextarea) {
        exportTextarea.select();
        navigator.clipboard.writeText(exportTextarea.value).then(() => {
          showToast("คัดลอก Ticker List เรียบร้อย! นำไปวางใน Webull ได้เลย");
          if (exportModal) exportModal.classList.remove("active");
        });
      }
    });
  }

  // 14. Subscribe to Live Market Tick Simulation
  window.dataEngine.subscribe((stocks) => {
    // Keep list and hero updated if current stock ticked
    renderStockList();
    if (currentStock) {
      const updated = stocks.find(s => s.ticker === currentStock.ticker);
      if (updated) {
        currentStock = updated;
        const candles = window.dataEngine.getCandles(currentStock.ticker);
        currentTradePlan = window.signalEngine.generateTradePlan(currentStock, candles);
        
        if (heroPrice) heroPrice.textContent = `$${updated.price.toFixed(2)}`;
        if (heroChange) {
          const isUp = updated.change >= 0;
          heroChange.className = `hero-change-badge ${isUp ? 'up' : 'down'}`;
          heroChange.innerHTML = `${isUp ? '▲' : '▼'} ${isUp ? '+' : ''}${updated.change.toFixed(2)} (${isUp ? '+' : ''}${updated.changePercent.toFixed(2)}%)`;
        }
        if (heroRvol) heroRvol.textContent = `${updated.rvol}x`;
        if (chart) chart.updateData(candles, currentTradePlan);
      }
    }
  });

  // 15. Initial Bootstrapping
  renderTickerTape();
  renderStockList();
  selectStock("SOUN");
});
