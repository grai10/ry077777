# ⚡ Webull Momentum Sniper - เครื่องมือหาหุ้นซิ่ง & แผนเทรด SL/TP

**Webull Momentum Sniper Pro** คือเว็บแอปพลิเคชันและ Trading Terminal สำหรับเทรดเดอร์ตลาดหุ้นสหรัฐฯ (US Stock Market) ที่เน้นเล่น **"หุ้นซิ่ง" (Momentum / Low Float / Breakout / High RVol Stocks)** บนแพลตฟอร์ม **Webull** โดยรวบรวมเครื่องมือวิเคราะห์แนวรับ-แนวต้าน, สัญญาณเข้าซื้อ (Buy Signal), จุดตัดขาดทุน (Stop Loss: SL), และจุดขายทำกำไรหลายระดับ (Take Profit: TP1/TP2/TP3) พร้อมระบบคำนวณขนาดไม้ (Position Sizing) ครบจบในที่เดียว

---

## 🚀 ฟีเจอร์หลัก (Core Features)

### 1. 🔍 Momentum Screener (ตัวสแกนหาหุ้นซิ่ง)
- **⚡ Pre-Market Gap Runners:** สแกนหาหุ้นที่มีข่าวและ Gap Up > 5% พร้อมวอลุ่มผิดปกติ (High RVol) ก่อนตลาดเปิด
- **💥 Breakout Surge:** สแกนหาหุ้นที่กำลังทดสอบแนวต้านสำคัญ หรือ High of Day พร้อมวอลุ่มเข้าหนาแน่น
- **🏎️ Low Float Movers (<30M):** สแกนหาหุ้นที่มีหุ้นหมุนเวียนต่ำ ทำให้ราคาพุ่งได้ไวและแรง เหมาะกับ Day Trade
- **🔄 VWAP / EMA Pullback:** สแกนหาจังหวะย่อตัวทดสอบแนวรับเส้น VWAP หรือ EMA 9 แล้วเด้งกลับ (จุดเข้าความเสี่ยงต่ำ)
- **🌋 Super Momentum:** คัดหุ้นที่แรงจัด RSI > 60, RVol > 2.5x และพุ่งขึ้นต่อเนื่อง
- **💎 Penny Stock Runners ($1 - $5):** หุ้นราคาเบาที่พร้อมระเบิดฟอร์ม

### 2. 🎯 Smart Buy / SL / TP Engine (คำนวณจุดซื้อ-ขาย-ตัดขาดทุนอัตโนมัติ)
ระบบคำนวณจุดเข้าและจุดออกให้แบบเรียลไทม์:
- **🟢 จุดเข้าซื้อ (Entry Price):** คำนวณราคาที่ควรเคาะซื้อตามประเภทของกลยุทธ์ (เช่น Breakout Confirmation หรือ VWAP Bounce)
- **🔴 จุดตัดขาดทุน (Stop Loss - SL):** คำนวณจุด SL ชัดเจน โดยอิงจาก ATR (ความผันผวน), แนวรับ Swing Low ล่าสุด และเส้น VWAP ป้องกันพอร์ตแตก
- **🎯 Take Profit 1 (TP1):** เป้าแรกที่ R:R 1.5R (แนะนำให้แบ่งขาย 50% เพื่อล็อกกำไรและเลื่อน SL มาที่ทุน)
- **🏆 Take Profit 2 (TP2):** เป้าแนวต้านหลักที่ R:R 2.5R - 3.0R
- **🚀 Take Profit 3 (TP3 / Runner):** เป้า High เดิม หรือขยายตาม Fibonacci Extension สำหรับไม้รันเทรนด์
- **⚖️ Risk-to-Reward Ratio (R:R):** เช็คความคุ้มค่าของการเทรดทันที (แนะนำ R:R >= 1:2 ขึ้นไป)

### 3. 📊 Interactive Candlestick Chart
- ชาร์ตแท่งเทียนความเร็วสูง 60fps
- แสดงเส้นเลเวลบนกราฟชัดเจน: **🟢 เส้น Entry**, **🔴 เส้น Stop Loss**, **🟡 เส้น TP1**, **🔵 เส้น TP2**, **🟣 เส้นแนวรับ-แนวต้าน**
- อินดิเคเตอร์ครบ: **VWAP**, **EMA 9**, **EMA 21**, และ Volume Bar พร้อม Heatmap

### 4. 🧮 Webull Position Size & Risk Calculator
- ป้องกันการ Overtrade โดยคำนวณจำนวนหุ้น (Shares to buy) จากเงินทุนและ % ความเสี่ยงที่ยอมรับได้
- แสดงมูลค่ารวมของไม้ ($ Position Size), ความเสี่ยงขาดทุนสูงสุด ($ Max Loss), และกำไรคาดหวังในแต่ละเป้าหมาย ($ Expected Gain)

### 5. 📋 ส่งออก Watchlist ไปยัง Webull
- กดปุ่ม **"Export to Webull"** เพื่อคัดลอกรายชื่อ Ticker ทั้งหมด แล้วนำไป Paste ลงใน Webull Desktop หรือ Webull Mobile App ได้ในคลิกเดียว

---

## 🛠️ วิธีเปิดใช้งานโปรแกรม

เปิดไฟล์ `index.html` บนเว็บเบราว์เซอร์ (Chrome, Edge, Brave, Safari ฯลฯ) ได้ทันที:

```powershell
# วิธีที่ 1: ดับเบิ้ลคลิกไฟล์ index.html ในโฟลเดอร์

# วิธีที่ 2: เปิดผ่านคำสั่ง PowerShell
Start-Process "index.html"
```

---

## 📖 คู่มือกลยุทธ์การเทรดหุ้นซิ่งบน Webull

| กลยุทธ์ (Strategy) | จังหวะเข้าซื้อ (Entry) | จุดตัดขาดทุน (Stop Loss) | จุดขายทำกำไร (Take Profit) |
| :--- | :--- | :--- | :--- |
| **💥 Resistance Breakout** | ซื้อทันทีเมื่อแท่ง 5M ทะลุแนวต้านสำคัญหรือ Pre-Market High พร้อมวอลุ่มหนาแน่น | วาง SL ใต้แนวต้านเดิมเล็กน้อย (Resistance turned Support) | แบ่งขาย 50% ที่ TP1 (+5-8%) และขายส่วนที่เหลือที่ TP2 (+15-20%) |
| **🔄 VWAP Dip & Rip** | รอให้ราคาย่อลงมาแตะเส้นส้ม (VWAP) แล้วเกิดแท่งเทียนกลับตัว (Hammer / Bullish Engulfing) | วาง SL ใต้เส้น VWAP 1-2% | ขายทำกำไรที่ High of Day หรือ TP1 / TP2 |
| **📈 EMA 9 Trend Ride** | ซื้อเมื่อราคาย่อมาแตะเส้นฟ้า (EMA 9) ในช่วงแนวโน้มขาขึ้น | วาง SL ใต้เส้น EMA 21 | ปล่อยให้กำไรวิ่ง (Let profits run) จนกว่าจะหลุดต่ำกว่า EMA 9 |

---

## 💡 คำแนะนำการตั้งค่าใน Webull

1. **ตั้ง Alert แจ้งเตือน:** นำราคา **Entry** และ **Resistance (R1)** จากโปรแกรมไปตั้ง Price Alert ใน Webull
2. **ใช้คำสั่ง Stop-Loss / Take-Profit (OCO Order):** ใน Webull ให้เลือก Order Type เป็น **"Group Order (OCO/OTO)"** แล้วกรอกราคา TP และ SL ตามที่โปรแกรมคำนวณให้ เพื่อป้องกันความลังเลขณะเทรด
3. **อย่าลืมเช็ค Catalyst:** ตรวจสอบข่าวประชาสัมพันธ์ (PR) หรือผลประกอบการก่อนตลาดเปิดเสมอ
