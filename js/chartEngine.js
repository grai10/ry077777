/**
 * Webull Interactive Candlestick Chart Engine (Canvas 60fps)
 * High-DPI rendering, Overlays for Entry, SL, TP1, TP2, TP3, Support/Resistance,
 * VWAP, EMA 9/21, Volume Profile, and Interactive Crosshair.
 */

class ChartEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.candles = [];
    this.tradePlan = null;
    this.hoverIndex = -1;
    this.hoverPos = null;
    this.showIndicators = {
      ema9: true,
      ema21: true,
      vwap: true,
      levels: true,
      srBands: true
    };

    this.setupEventListeners();
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 800;
    this.height = rect.height || 460;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(dpr, dpr);
    this.render();
  }

  setupEventListeners() {
    if (!this.canvas) return;

    // Mouse Events
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.hoverPos = { x, y };
      this.render();
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.hoverPos = null;
      this.render();
    });

    // Touch Events for iPad & iPhone
    this.canvas.addEventListener("touchstart", (e) => {
      if (e.touches && e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        this.hoverPos = { x, y };
        this.render();
      }
    }, { passive: true });

    this.canvas.addEventListener("touchmove", (e) => {
      if (e.touches && e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        this.hoverPos = { x, y };
        this.render();
      }
    }, { passive: true });

    this.canvas.addEventListener("touchend", () => {
      // Keep hoverPos for 2.5s on mobile or reset
      setTimeout(() => {
        this.hoverPos = null;
        this.render();
      }, 2500);
    });
  }

  updateData(candles, tradePlan) {
    this.candles = candles || [];
    this.tradePlan = tradePlan || null;
    this.render();
  }

  render() {
    if (!this.ctx || !this.candles || this.candles.length === 0) return;

    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;

    // Layout configuration
    const padding = { top: 30, right: 75, bottom: 65, left: 15 };
    const chartHeight = height - padding.top - padding.bottom;
    const volumeHeight = 60;
    const candleAreaHeight = chartHeight - volumeHeight - 15;

    // Clear background
    ctx.fillStyle = "#0c111d";
    ctx.fillRect(0, 0, width, height);

    // Calculate Price Min / Max with padding for trade lines
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    this.candles.forEach(c => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    });

    // Include TP & SL in scale if tradePlan exists
    if (this.tradePlan) {
      if (this.tradePlan.tp3 && this.tradePlan.tp3 > maxPrice) maxPrice = this.tradePlan.tp3 * 1.02;
      if (this.tradePlan.stopLoss && this.tradePlan.stopLoss < minPrice) minPrice = this.tradePlan.stopLoss * 0.98;
    }

    const priceRange = (maxPrice - minPrice) || 1;
    const candleWidth = Math.max(3, (width - padding.left - padding.right) / this.candles.length);
    const bodyWidth = Math.max(2, candleWidth * 0.7);

    // Coordinate conversion helpers
    const getX = (index) => padding.left + index * candleWidth + candleWidth / 2;
    const getY = (price) => padding.top + candleAreaHeight - ((price - minPrice) / priceRange) * candleAreaHeight;
    const getVolY = (vol) => height - padding.bottom - (vol / (maxVolume || 1)) * volumeHeight;

    // 1. Draw Grid Lines & Price Labels
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.font = "10px Inter, -apple-system, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "left";

    const gridSteps = 6;
    for (let i = 0; i <= gridSteps; i++) {
      const p = minPrice + (priceRange / gridSteps) * i;
      const y = getY(p);

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillText(`$${p.toFixed(2)}`, width - padding.right + 8, y + 3);
    }

    // 2. Draw Volume Bars
    for (let i = 0; i < this.candles.length; i++) {
      const c = this.candles[i];
      const isBull = c.close >= c.open;
      const x = getX(i) - bodyWidth / 2;
      const y = getVolY(c.volume);
      const h = height - padding.bottom - y;

      ctx.fillStyle = isBull ? "rgba(0, 245, 155, 0.25)" : "rgba(255, 51, 102, 0.25)";
      ctx.fillRect(x, y, bodyWidth, h);
    }

    // 3. Draw Indicators (VWAP, EMA 9, EMA 21)
    if (this.showIndicators.vwap) {
      ctx.strokeStyle = "#ff9800"; // Orange
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < this.candles.length; i++) {
        if (this.candles[i].vwap) {
          const x = getX(i);
          const y = getY(this.candles[i].vwap);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    const ema9 = window.technicalEngine.calculateEMA(this.candles, 9);
    if (this.showIndicators.ema9 && ema9.length > 0) {
      ctx.strokeStyle = "#00d2ff"; // Cyan EMA 9
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < this.candles.length; i++) {
        if (ema9[i] !== undefined) {
          const x = getX(i);
          const y = getY(ema9[i]);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    const ema21 = window.technicalEngine.calculateEMA(this.candles, 21);
    if (this.showIndicators.ema21 && ema21.length > 0) {
      ctx.strokeStyle = "#d946ef"; // Magenta EMA 21
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < this.candles.length; i++) {
        if (ema21[i] !== undefined) {
          const x = getX(i);
          const y = getY(ema21[i]);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // 4. Draw Candlesticks (Wicks & Bodies)
    for (let i = 0; i < this.candles.length; i++) {
      const c = this.candles[i];
      const isBull = c.close >= c.open;
      const x = getX(i);
      const bodyX = x - bodyWidth / 2;
      const openY = getY(c.open);
      const closeY = getY(c.close);
      const highY = getY(c.high);
      const lowY = getY(c.low);

      const color = isBull ? "#00f59b" : "#ff3366";

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Candle Body
      const topY = Math.min(openY, closeY);
      const bodyH = Math.max(2, Math.abs(closeY - openY));
      ctx.fillStyle = color;
      ctx.fillRect(bodyX, topY, bodyWidth, bodyH);
    }

    // 5. Draw Trade Plan Lines (ENTRY, SL, TP1, TP2, TP3)
    if (this.tradePlan && this.showIndicators.levels) {
      const tp = this.tradePlan;

      // Helper for drawing dashed horizontal level line + badge
      const drawLevelLine = (price, label, color, dash = [6, 4], badgeText = "") => {
        if (!price) return;
        const y = getY(price);
        if (y < padding.top || y > height - padding.bottom) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash(dash);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash

        // Right side badge
        ctx.fillStyle = color;
        const text = `${label} $${price.toFixed(2)} ${badgeText}`;
        const textWidth = ctx.measureText(text).width;
        
        ctx.beginPath();
        ctx.roundRect(width - padding.right + 4, y - 9, textWidth + 8, 18, 4);
        ctx.fill();

        ctx.fillStyle = "#090d16";
        ctx.font = "bold 10px Inter, sans-serif";
        ctx.fillText(text, width - padding.right + 8, y + 3);
      };

      // Draw Support & Resistance if enabled
      if (this.showIndicators.srBands && tp.sr) {
        drawLevelLine(tp.sr.r1, "R1", "rgba(255, 184, 0, 0.6)", [2, 4]);
        drawLevelLine(tp.sr.s1, "S1", "rgba(56, 189, 248, 0.6)", [2, 4]);
      }

      // Entry Line
      drawLevelLine(tp.entryPrice, "🟢 ENTRY", "#00f59b", [5, 3]);

      // Stop Loss Line
      drawLevelLine(tp.stopLoss, "🔴 SL", "#ff3366", [5, 3], `(-${tp.riskPercent}%)`);

      // TP Levels
      drawLevelLine(tp.tp1, "🎯 TP1", "#ffb800", [4, 4], `(+${tp.tp1Percent}%)`);
      drawLevelLine(tp.tp2, "🏆 TP2", "#00d2ff", [4, 4], `(+${tp.tp2Percent}%)`);
      if (tp.tp3) {
        drawLevelLine(tp.tp3, "🚀 TP3", "#10b981", [4, 4], `(+${tp.tp3Percent}%)`);
      }
    }

    // 6. Interactive Crosshair & Tooltip
    if (this.hoverPos) {
      const hx = this.hoverPos.x;
      const hy = this.hoverPos.y;

      if (hx >= padding.left && hx <= width - padding.right && hy >= padding.top && hy <= height - padding.bottom) {
        // Crosshair Lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        
        ctx.beginPath();
        ctx.moveTo(hx, padding.top);
        ctx.lineTo(hx, height - padding.bottom);
        ctx.moveTo(padding.left, hy);
        ctx.lineTo(width - padding.right, hy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Find hovered candle
        const candleIndex = Math.min(
          this.candles.length - 1,
          Math.max(0, Math.floor((hx - padding.left) / candleWidth))
        );
        const candle = this.candles[candleIndex];

        if (candle) {
          // Top Header Tooltip
          const isBull = candle.close >= candle.open;
          const statusColor = isBull ? "#00f59b" : "#ff3366";
          ctx.font = "11px Inter, sans-serif";
          ctx.fillStyle = "#94a3b8";
          const headerText = `O: $${candle.open.toFixed(2)}  H: $${candle.high.toFixed(2)}  L: $${candle.low.toFixed(2)}  C: $${candle.close.toFixed(2)}  Vol: ${(candle.volume / 1000).toFixed(0)}k  VWAP: $${candle.vwap ? candle.vwap.toFixed(2) : "-"}`;
          ctx.fillText(headerText, padding.left + 5, padding.top - 10);

          // Price Tag on Y-Axis
          const curHoverPrice = minPrice + ((padding.top + candleAreaHeight - hy) / candleAreaHeight) * priceRange;
          ctx.fillStyle = "#38bdf8";
          ctx.beginPath();
          ctx.roundRect(width - padding.right + 4, hy - 9, 65, 18, 4);
          ctx.fill();
          ctx.fillStyle = "#090d16";
          ctx.font = "bold 10px Inter, sans-serif";
          ctx.fillText(`$${curHoverPrice.toFixed(2)}`, width - padding.right + 8, hy + 3);
        }
      }
    }
  }
}

window.ChartEngine = ChartEngine;
