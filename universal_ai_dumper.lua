--[[
    ========================================================================
    🔥 UNIVERSAL AI DUMPER & REMOTE SPY TOOL (VALEN HUB STYLE)
    - เครื่องมือ Dump ข้อมูล Map, Remote, และ Objects สำหรับส่งให้ AI เขียนโปร
    - รองรับตัวรันทุกตัว: Delta, Fluxus, Codex, Arceus X, Wave, Solara, ฯลฯ
    ========================================================================
]]

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local CoreGui = game:GetService("CoreGui")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local RunService = game:GetService("RunService")
local LocalPlayer = Players.LocalPlayer

-- ป้องกันการเปิด GUI ซ้ำ
if CoreGui:FindFirstChild("ValenAIDumperUI") then
    CoreGui.ValenAIDumperUI:Destroy()
end

-- =========================================================================
-- [1] HELPER FUNCTIONS (ฟังก์ชันแปลงข้อมูล)
-- =========================================================================

local function safeSerialize(val)
    local t = typeof(val)
    if t == "Vector3" then
        return string.format("Vector3.new(%.2f, %.2f, %.2f)", val.X, val.Y, val.Z)
    elseif t == "CFrame" then
        local x, y, z = val.X, val.Y, val.Z
        return string.format("CFrame.new(%.2f, %.2f, %.2f)", x, y, z)
    elseif t == "Instance" then
        return val:GetFullName()
    elseif t == "Color3" then
        return string.format("Color3.fromRGB(%d, %d, %d)", val.R * 255, val.G * 255, val.B * 255)
    elseif t == "table" then
        local str = "{"
        for k, v in pairs(val) do
            str = str .. "[" .. tostring(safeSerialize(k)) .. "] = " .. tostring(safeSerialize(v)) .. ", "
        end
        return str .. "}"
    else
        return tostring(val)
    end
end

local function saveToFile(filename, content)
    filename = filename or "dump_output.txt"
    if not string.find(filename, "%.") then
        filename = filename .. ".txt"
    end
    
    if writefile then
        writefile(filename, content)
        return true, "บันทึกสำเร็จลงใน workspace/" .. filename
    else
        if setclipboard then
            setclipboard(content)
            return false, "ไม่มี writefile! ได้คัดลอกลง Clipboard แทนแล้ว"
        end
        return false, "ตัวรันไม่รองรับ writefile หรือ setclipboard"
    end
end

-- =========================================================================
-- [2] MODULE: MAP & STRUCTURAL DUMPER (ดึงข้อมูลโครงสร้าง Map & Services)
-- =========================================================================

local function dumpGameStructure(depthLimit, targetService)
    depthLimit = depthLimit or 4
    local servicesToDump = {}
    
    if targetService == "All" or not targetService then
        servicesToDump = {
            game:GetService("ReplicatedStorage"),
            game:GetService("Workspace"),
            game:GetService("Lighting")
        }
    elseif targetService == "ReplicatedStorage" then
        servicesToDump = { game:GetService("ReplicatedStorage") }
    elseif targetService == "Workspace" then
        servicesToDump = { game:GetService("Workspace") }
    end

    local result = {}
    table.insert(result, "=======================================================")
    table.insert(result, "🎮 GAME METADATA & STRUCTURAL DUMP FOR AI PROMPT")
    table.insert(result, "Place ID: " .. tostring(game.PlaceId) .. " | Game ID: " .. tostring(game.GameId))
    table.insert(result, "Time: " .. os.date("%Y-%m-%d %H:%M:%S"))
    table.insert(result, "Player: " .. LocalPlayer.Name)
    table.insert(result, "=======================================================\n")

    local function traverse(instance, currentDepth)
        if currentDepth > depthLimit then return end
        
        local indent = string.rep("  ", currentDepth)
        local extraInfo = ""
        
        if instance:IsA("RemoteEvent") or instance:IsA("RemoteFunction") or instance:IsA("BindableEvent") then
            extraInfo = " [REMOTE: " .. instance.ClassName .. "]"
        elseif instance:IsA("Model") then
            if instance:FindFirstChildOfClass("Humanoid") then
                local hum = instance:FindFirstChildOfClass("Humanoid")
                extraInfo = string.format(" [NPC/MOB | HP: %.0f/%.0f]", hum.Health, hum.MaxHealth)
            end
        elseif instance:IsA("ProximityPrompt") then
            extraInfo = " [PROMPT: " .. instance.ActionText .. " | Object: " .. instance.ObjectText .. "]"
        elseif instance:IsA("ClickDetector") then
            extraInfo = " [CLICK DETECTOR]"
        elseif instance:IsA("BasePart") then
            local pos = instance.Position
            extraInfo = string.format(" [PART Pos: %.1f, %.1f, %.1f]", pos.X, pos.Y, pos.Z)
        end

        table.insert(result, indent .. "- " .. instance.Name .. " (" .. instance.ClassName .. ")" .. extraInfo)
        
        for _, child in ipairs(instance:GetChildren()) do
            traverse(child, currentDepth + 1)
        end
    end

    for _, srv in ipairs(servicesToDump) do
        table.insert(result, "\n--- SERVICE: " .. srv.Name .. " ---")
        traverse(srv, 1)
    end

    return table.concat(result, "\n")
end

-- =========================================================================
-- [3] MODULE: REMOTE SCANNER (สแกนหา Remote ทั้งหมดในเกม)
-- =========================================================================

local function scanAllRemotes(filterKeyword)
    filterKeyword = filterKeyword and string.lower(filterKeyword) or ""
    local remotes = {}
    local report = {}

    table.insert(report, "=======================================================")
    table.insert(report, "📡 ALL DETECTED REMOTES (SCAN REPORT)")
    table.insert(report, "Filter Keyword: " .. (filterKeyword ~= "" and filterKeyword or "None"))
    table.insert(report, "=======================================================")

    for _, obj in ipairs(game:GetDescendants()) do
        if obj:IsA("RemoteEvent") or obj:IsA("RemoteFunction") or obj:IsA("UnreliableRemoteEvent") then
            local fullName = obj:GetFullName()
            if filterKeyword == "" or string.find(string.lower(fullName), filterKeyword) then
                table.insert(remotes, {
                    Name = obj.Name,
                    Class = obj.ClassName,
                    Path = fullName
                })
                
                table.insert(report, string.format("[%s] %s", obj.ClassName, fullName))
                table.insert(report, string.format("  -- Example Call:"))
                if obj:IsA("RemoteEvent") then
                    table.insert(report, string.format("  %s:FireServer(...)\n", fullName))
                else
                    table.insert(report, string.format("  %s:InvokeServer(...)\n", fullName))
                end
            end
        end
    end

    table.insert(report, "\nTotal Remotes Found: " .. tostring(#remotes))
    return table.concat(report, "\n"), #remotes
end

-- =========================================================================
-- [4] MODULE: REMOTE RECORDER / SPY (บันทึก Remote ที่ถูกยิงตอนเล่นเกม)
-- =========================================================================

local isRecording = false
local recordedLogs = {}
local oldNamecall = nil

local function startRemoteRecording()
    if isRecording then return end
    isRecording = true
    recordedLogs = {}
    
    table.insert(recordedLogs, "=======================================================")
    table.insert(recordedLogs, "🔴 REMOTE SPY RECORD LOGS (ACTIVE SESSION)")
    table.insert(recordedLogs, "Started at: " .. os.date("%H:%M:%S"))
    table.insert(recordedLogs, "=======================================================\n")

    if hookmetamethod and getnamecallmethod then
        oldNamecall = hookmetamethod(game, "__namecall", function(self, ...)
            local method = getnamecallmethod()
            local args = {...}
            
            if isRecording and (method == "FireServer" or method == "fireServer" or method == "InvokeServer" or method == "invokeServer") then
                if self:IsA("RemoteEvent") or self:IsA("RemoteFunction") or self:IsA("UnreliableRemoteEvent") then
                    local logEntry = string.format(
                        "[%s] [%s] %s\n  Method: :%s()\n  Arguments: (%s)\n",
                        os.date("%H:%M:%S"),
                        self.ClassName,
                        self:GetFullName(),
                        method,
                        safeSerialize(args)
                    )
                    table.insert(recordedLogs, logEntry)
                end
            end
            
            return oldNamecall(self, ...)
        end)
    end
end

local function stopRemoteRecording()
    isRecording = false
    table.insert(recordedLogs, "\n-- Stopped Recording at: " .. os.date("%H:%M:%S"))
    return table.concat(recordedLogs, "\n")
end

-- =========================================================================
-- [5] USER INTERFACE (หน้าต่าง UI สวยหรู สไตล์ Valen Hub Dark Theme)
-- =========================================================================

local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "ValenAIDumperUI"
ScreenGui.ResetOnSpawn = false

-- ตรวจสอบ parent ให้เข้ากับ executor
if syn and syn.protect_gui then
    syn.protect_gui(ScreenGui)
    ScreenGui.Parent = CoreGui
elseif gethui then
    ScreenGui.Parent = gethui()
else
    ScreenGui.Parent = CoreGui
end

-- Main Frame
local MainFrame = Instance.new("Frame")
MainFrame.Name = "MainFrame"
MainFrame.Size = UDim2.new(0, 480, 0, 430)
MainFrame.Position = UDim2.new(0.5, -240, 0.5, -215)
MainFrame.BackgroundColor3 = Color3.fromRGB(20, 22, 28)
MainFrame.BorderSizePixel = 0
MainFrame.Active = true
MainFrame.Draggable = true
MainFrame.Parent = ScreenGui

local UICorner = Instance.new("UICorner", MainFrame)
UICorner.CornerRadius = UDim.new(0, 10)

local UIStroke = Instance.new("UIStroke", MainFrame)
UIStroke.Color = Color3.fromRGB(60, 65, 85)
UIStroke.Thickness = 1.2

-- Header Bar
local Header = Instance.new("Frame")
Header.Size = UDim2.new(1, 0, 0, 45)
Header.BackgroundColor3 = Color3.fromRGB(28, 31, 40)
Header.BorderSizePixel = 0
Header.Parent = MainFrame

local HeaderCorner = Instance.new("UICorner", Header)
HeaderCorner.CornerRadius = UDim.new(0, 10)

local Title = Instance.new("TextLabel")
Title.Text = "⚡ VALEN AI DUMPER & REMOTE SPY"
Title.Font = Enum.Font.GothamBold
Title.TextSize = 14
Title.TextColor3 = Color3.fromRGB(255, 255, 255)
Title.Position = UDim2.new(0, 15, 0, 0)
Title.Size = UDim2.new(0.7, 0, 1, 0)
Title.TextXAlignment = Enum.TextXAlignment.Left
Title.BackgroundTransparency = 1
Title.Parent = Header

local SubTitle = Instance.new("TextLabel")
SubTitle.Text = "Universal Game Dumper for AI"
SubTitle.Font = Enum.Font.Gotham
SubTitle.TextSize = 11
SubTitle.TextColor3 = Color3.fromRGB(130, 140, 165)
SubTitle.Position = UDim2.new(0, 15, 0, 24)
SubTitle.Size = UDim2.new(0.7, 0, 0, 16)
SubTitle.TextXAlignment = Enum.TextXAlignment.Left
SubTitle.BackgroundTransparency = 1
SubTitle.Parent = Header

-- Close Button
local CloseBtn = Instance.new("TextButton")
CloseBtn.Text = "✕"
CloseBtn.Font = Enum.Font.GothamBold
CloseBtn.TextSize = 14
CloseBtn.TextColor3 = Color3.fromRGB(200, 200, 200)
CloseBtn.Position = UDim2.new(1, -35, 0, 10)
CloseBtn.Size = UDim2.new(0, 25, 0, 25)
CloseBtn.BackgroundColor3 = Color3.fromRGB(40, 44, 56)
CloseBtn.Parent = Header
Instance.new("UICorner", CloseBtn).CornerRadius = UDim.new(0, 6)

CloseBtn.MouseButton1Click:Connect(function()
    ScreenGui:Destroy()
end)

-- Content Area
local Container = Instance.new("ScrollingFrame")
Container.Size = UDim2.new(1, -20, 1, -60)
Container.Position = UDim2.new(0, 10, 0, 50)
Container.BackgroundTransparency = 1
Container.ScrollBarThickness = 4
Container.CanvasSize = UDim2.new(0, 0, 0, 480)
Container.Parent = MainFrame

local UIList = Instance.new("UIListLayout", Container)
UIList.Padding = UDim.new(0, 10)
UIList.SortOrder = Enum.SortOrder.LayoutOrder

-- Status Label
local StatusLabel = Instance.new("TextLabel")
StatusLabel.Text = "พร้อมทำงาน: กรุณาเลือกฟังก์ชันที่ต้องการ"
StatusLabel.Font = Enum.Font.Gotham
StatusLabel.TextSize = 12
StatusLabel.TextColor3 = Color3.fromRGB(0, 230, 160)
StatusLabel.Size = UDim2.new(1, 0, 0, 22)
StatusLabel.BackgroundTransparency = 1
StatusLabel.LayoutOrder = 0
StatusLabel.Parent = Container

-- Helper function to make UI cards
local function createCard(titleText, descText, layoutOrder)
    local card = Instance.new("Frame")
    card.Size = UDim2.new(1, -6, 0, 95)
    card.BackgroundColor3 = Color3.fromRGB(28, 31, 40)
    card.BorderSizePixel = 0
    card.LayoutOrder = layoutOrder
    card.Parent = Container
    Instance.new("UICorner", card).CornerRadius = UDim.new(0, 8)
    
    local cTitle = Instance.new("TextLabel")
    cTitle.Text = titleText
    cTitle.Font = Enum.Font.GothamBold
    cTitle.TextSize = 13
    cTitle.TextColor3 = Color3.fromRGB(255, 255, 255)
    cTitle.Position = UDim2.new(0, 12, 0, 8)
    cTitle.Size = UDim2.new(1, -24, 0, 18)
    cTitle.TextXAlignment = Enum.TextXAlignment.Left
    cTitle.BackgroundTransparency = 1
    cTitle.Parent = card

    local cDesc = Instance.new("TextLabel")
    cDesc.Text = descText
    cDesc.Font = Enum.Font.Gotham
    cDesc.TextSize = 11
    cDesc.TextColor3 = Color3.fromRGB(140, 150, 175)
    cDesc.Position = UDim2.new(0, 12, 0, 26)
    cDesc.Size = UDim2.new(1, -24, 0, 16)
    cDesc.TextXAlignment = Enum.TextXAlignment.Left
    cDesc.BackgroundTransparency = 1
    cDesc.Parent = card

    return card
end

-- CARD 1: DUMP FILE MAP & STRUCTURE
local Card1 = createCard("📁 1. Dump File Map & Code (โครงสร้างเกม)", "ดึงข้อมูล ReplicatedStorage, Workspace, Mobs และ Position ไปให้ AI", 1)

local InputFileName1 = Instance.new("TextBox")
InputFileName1.PlaceholderText = "ชื่อไฟล์ (เช่น map_dump.txt)"
InputFileName1.Text = "map_dump.txt"
InputFileName1.Font = Enum.Font.Gotham
InputFileName1.TextSize = 11
InputFileName1.TextColor3 = Color3.fromRGB(255, 255, 255)
InputFileName1.BackgroundColor3 = Color3.fromRGB(36, 40, 52)
InputFileName1.Position = UDim2.new(0, 12, 0, 52)
InputFileName1.Size = UDim2.new(0.55, -15, 0, 30)
InputFileName1.Parent = Card1
Instance.new("UICorner", InputFileName1).CornerRadius = UDim.new(0, 6)

local DumpBtn = Instance.new("TextButton")
DumpBtn.Text = "🚀 Start Dump"
DumpBtn.Font = Enum.Font.GothamBold
DumpBtn.TextSize = 12
DumpBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
DumpBtn.BackgroundColor3 = Color3.fromRGB(50, 120, 240)
DumpBtn.Position = UDim2.new(0.58, 0, 0, 52)
DumpBtn.Size = UDim2.new(0.4, 0, 0, 30)
DumpBtn.Parent = Card1
Instance.new("UICorner", DumpBtn).CornerRadius = UDim.new(0, 6)

DumpBtn.MouseButton1Click:Connect(function()
    StatusLabel.Text = "⏳ กำลัง Dump โครงสร้างเกม... กรุณารอสักครู่"
    StatusLabel.TextColor3 = Color3.fromRGB(240, 190, 50)
    task.wait(0.1)
    
    local content = dumpGameStructure(4, "All")
    local success, msg = saveToFile(InputFileName1.Text, content)
    
    StatusLabel.Text = "✅ " .. msg
    StatusLabel.TextColor3 = Color3.fromRGB(0, 230, 160)
end)

-- CARD 2: REMOTE SPY & RECORD
local Card2 = createCard("🎙️ 2. Remote Recorder (ดักจับ Event & เควสต์)", "อัด Remote ตอนเล่นเกม เช่น สกิล, รับเควสต์, ซื้อของ เพื่อดู Parameter", 2)
Card2.Size = UDim2.new(1, -6, 0, 100)

local RecBtn = Instance.new("TextButton")
RecBtn.Text = "🔴 Start Record"
RecBtn.Font = Enum.Font.GothamBold
RecBtn.TextSize = 12
RecBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
RecBtn.BackgroundColor3 = Color3.fromRGB(220, 60, 60)
RecBtn.Position = UDim2.new(0, 12, 0, 54)
RecBtn.Size = UDim2.new(0.46, 0, 0, 32)
RecBtn.Parent = Card2
Instance.new("UICorner", RecBtn).CornerRadius = UDim.new(0, 6)

local SaveRecBtn = Instance.new("TextButton")
SaveRecBtn.Text = "💾 Save to File"
SaveRecBtn.Font = Enum.Font.GothamBold
SaveRecBtn.TextSize = 12
SaveRecBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
SaveRecBtn.BackgroundColor3 = Color3.fromRGB(45, 160, 90)
SaveRecBtn.Position = UDim2.new(0.52, 0, 0, 54)
SaveRecBtn.Size = UDim2.new(0.46, 0, 0, 32)
SaveRecBtn.Parent = Card2
Instance.new("UICorner", SaveRecBtn).CornerRadius = UDim.new(0, 6)

RecBtn.MouseButton1Click:Connect(function()
    if not isRecording then
        startRemoteRecording()
        RecBtn.Text = "⏹️ Stop Record"
        RecBtn.BackgroundColor3 = Color3.fromRGB(150, 150, 150)
        StatusLabel.Text = "🔴 กำลังอัด Remote... ลองกดใช้สกิล/ทำเควสต์ในเกมได้เลย"
        StatusLabel.TextColor3 = Color3.fromRGB(255, 80, 80)
    else
        stopRemoteRecording()
        RecBtn.Text = "🔴 Start Record"
        RecBtn.BackgroundColor3 = Color3.fromRGB(220, 60, 60)
        StatusLabel.Text = "⏹️ หยุดอัดแล้ว กด Save to File เพื่อเซฟลงเครื่อง"
        StatusLabel.TextColor3 = Color3.fromRGB(240, 190, 50)
    end
end)

SaveRecBtn.MouseButton1Click:Connect(function()
    local logData = table.concat(recordedLogs, "\n")
    if #recordedLogs == 0 then
        StatusLabel.Text = "⚠️ ยังไม่มีข้อมูล Remote ที่อัดไว้!"
        StatusLabel.TextColor3 = Color3.fromRGB(240, 100, 100)
        return
    end
    local success, msg = saveToFile("recorded_remotes.txt", logData)
    StatusLabel.Text = "✅ " .. msg
    StatusLabel.TextColor3 = Color3.fromRGB(0, 230, 160)
end)

-- CARD 3: REMOTE SCANNER
local Card3 = createCard("🔍 3. Remote Scanner (สแกนหา Remote ทั้งหมด)", "ค้นหา Remote ทั้งเกม พร้อมสร้างโค้ดตัวอย่าง :FireServer() ให้ AI", 3)

local ScanFilter = Instance.new("TextBox")
ScanFilter.PlaceholderText = "คำค้นหา (เช่น Quest, Attack, Buy) ปล่อยว่าง=ทั้งหมด"
ScanFilter.Text = ""
ScanFilter.Font = Enum.Font.Gotham
ScanFilter.TextSize = 11
ScanFilter.TextColor3 = Color3.fromRGB(255, 255, 255)
ScanFilter.BackgroundColor3 = Color3.fromRGB(36, 40, 52)
ScanFilter.Position = UDim2.new(0, 12, 0, 52)
ScanFilter.Size = UDim2.new(0.55, -15, 0, 30)
ScanFilter.Parent = Card3
Instance.new("UICorner", ScanFilter).CornerRadius = UDim.new(0, 6)

local ScanBtn = Instance.new("TextButton")
ScanBtn.Text = "📡 Scan All"
ScanBtn.Font = Enum.Font.GothamBold
ScanBtn.TextSize = 12
ScanBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
ScanBtn.BackgroundColor3 = Color3.fromRGB(130, 60, 220)
ScanBtn.Position = UDim2.new(0.58, 0, 0, 52)
ScanBtn.Size = UDim2.new(0.4, 0, 0, 30)
ScanBtn.Parent = Card3
Instance.new("UICorner", ScanBtn).CornerRadius = UDim.new(0, 6)

ScanBtn.MouseButton1Click:Connect(function()
    StatusLabel.Text = "⏳ กำลังสแกนหารายชื่อ Remote..."
    StatusLabel.TextColor3 = Color3.fromRGB(240, 190, 50)
    task.wait(0.1)
    
    local report, count = scanAllRemotes(ScanFilter.Text)
    local success, msg = saveToFile("scanned_remotes.txt", report)
    StatusLabel.Text = string.format("✅ สแกนเจอ %d Remotes! %s", count, msg)
    StatusLabel.TextColor3 = Color3.fromRGB(0, 230, 160)
end)

-- CARD 4: DEX & UTILITY LAUNCHER
local Card4 = createCard("🛠️ 4. Quick Tools (SimpleSpy & Dark Dex)", "เปิดเครื่องมือช่วยตรวจดู Object และจำลองการยิง Remote", 4)
Card4.Size = UDim2.new(1, -6, 0, 90)

local DexBtn = Instance.new("TextButton")
DexBtn.Text = "📦 Open Dark Dex"
DexBtn.Font = Enum.Font.GothamBold
DexBtn.TextSize = 11
DexBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
DexBtn.BackgroundColor3 = Color3.fromRGB(45, 52, 68)
DexBtn.Position = UDim2.new(0, 12, 0, 50)
DexBtn.Size = UDim2.new(0.46, 0, 0, 28)
DexBtn.Parent = Card4
Instance.new("UICorner", DexBtn).CornerRadius = UDim.new(0, 6)

local SpyBtn = Instance.new("TextButton")
SpyBtn.Text = "🕵️ Open SimpleSpy"
SpyBtn.Font = Enum.Font.GothamBold
SpyBtn.TextSize = 11
SpyBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
SpyBtn.BackgroundColor3 = Color3.fromRGB(45, 52, 68)
SpyBtn.Position = UDim2.new(0.52, 0, 0, 50)
SpyBtn.Size = UDim2.new(0.46, 0, 0, 28)
SpyBtn.Parent = Card4
Instance.new("UICorner", SpyBtn).CornerRadius = UDim.new(0, 6)

DexBtn.MouseButton1Click:Connect(function()
    StatusLabel.Text = "⏳ กำลังโหลด Dark Dex..."
    loadstring(game:HttpGet("https://raw.githubusercontent.com/Babyhamsta/RBLX_Scripts/main/Universal/BypassedDarkDexV3.lua"))()
    StatusLabel.Text = "✅ เปิด Dark Dex สำเร็จ!"
end)

SpyBtn.MouseButton1Click:Connect(function()
    StatusLabel.Text = "⏳ กำลังโหลด SimpleSpy..."
    loadstring(game:HttpGet("https://raw.githubusercontent.com/infyiff/backup/main/SimpleSpyV3/main.lua"))()
    StatusLabel.Text = "✅ เปิด SimpleSpy สำเร็จ!"
end)

print("⚡ [Valen AI Dumper] Loaded Successfully!")
