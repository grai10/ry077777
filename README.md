# 🔥 Universal AI Dumper & Remote Spy (Valen Hub Style)

เครื่องมือ Dump ข้อมูล Map, Remote, และ Objects สำหรับเกม Roblox เพื่อส่งต่อให้ AI (ChatGPT / Claude / DeepSeek) ช่วยเขียนสคริปต์และโปรฟาร์มให้อัตโนมัติ

## ⚡ วิธีรันสคริปต์ (Loadstring)

คัดลอกคำสั่งด้านล่างนี้ไปวางในตัวรัน (Delta / Codex / Fluxus / Arceus X / Solara / Wave):

```lua
loadstring(game:HttpGet("https://raw.githubusercontent.com/grai10/ry077777/main/universal_ai_dumper.lua"))()
```

---

## 🌟 ฟังก์ชันหลัก

1. **📁 Dump File Map & Code:**
   * ดึงโครงสร้าง `ReplicatedStorage`, `Workspace`, `Lighting`
   * สกัดตำแหน่ง Part, ข้อมูล Mob/NPC (HP), และ ProximityPrompts
   * บันทึกไฟล์ลงในโฟลเดอร์ `workspace/` ของตัวรัน
2. **🎙️ Remote Recorder (ดักจับ Event):**
   * Hook `__namecall` ดักจับ `:FireServer()` และ `:InvokeServer()` แบบ Real-time
   * บันทึก Remote ที่เกมเรียกใช้ พร้อม Parameters ที่ส่งจริง
3. **🔍 Remote Scanner:**
   * สแกนหา RemoteEvent / RemoteFunction ทั้งหมดในเกม
   * สร้างโค้ดตัวอย่าง `:FireServer(...)` ให้อัตโนมัติ
4. **🛠️ Quick Tools:**
   * มีปุ่มเปิด Dark Dex V3 และ SimpleSpy V3 ในตัว
