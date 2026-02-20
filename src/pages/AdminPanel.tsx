import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { SEOHead } from "@/components/SEOHead";
import { AdminLogin } from "@/components/AdminLogin";
import { isAdminLoggedIn, logoutAdmin } from "@/lib/auth";
import { getAdminSettings, saveAdminSettings, loadServerConfig, saveServerConfig, loadMainCsvFromServer, saveCsvData, type AdminSettings } from "@/lib/store";
import { saveCsvToServer, deleteCsvFromServer, loadCsvFromServer } from "@/lib/server-storage";
import { clearCsvCache } from "@/lib/csv-products";
import { applyThemeColor, THEME_OPTIONS } from "@/components/ThemeColorProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  X, Plus, Save, Flame, Sparkles,
  LogOut, Settings,
  Key, Upload, FileSpreadsheet, Database, Tag, Globe, Image as ImageIcon,
  Palette, Type,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

export default function AdminPanel() {
  const [authed, setAuthed] = useState(isAdminLoggedIn);

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Admin Panel" description="จัดการระบบและดูสถิติ" />
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">🛠 Admin Panel</h1>
          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5"
            onClick={() => { logoutAdmin(); setAuthed(false); }}
          >
            <LogOut className="h-4 w-4" />
            ออกจากระบบ
          </Button>
        </div>
        <SettingsTab />
      </main>
    </div>
  );
}

/* ========== Settings Tab ========== */
function SettingsTab() {
  const [settings, setSettings] = useState<AdminSettings>(getAdminSettings);
  const [newCategory, setNewCategory] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [newPrefixWord, setNewPrefixWord] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCategory, setUploadingCategory] = useState("");

  // Load server config on mount
  useEffect(() => {
    const load = async () => {
      const serverSettings = await loadServerConfig();
      setSettings(serverSettings);
      // Load main CSV from server to ensure it's in sync
      await loadMainCsvFromServer();
    };
    load();
  }, []);

  const update = (partial: Partial<AdminSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await saveServerConfig(settings);
      if (success) {
        clearCsvCache();
        applyThemeColor(settings.themeColor);
        toast.success("บันทึกการตั้งค่าเรียบร้อย! (บันทึกไว้บน Server)");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error("ไม่สามารถบันทึกไปยัง Server ได้");
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  const exportConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "site-config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success("ส่งออกการตั้งค่าเรียบร้อย!");
  };

  const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        setSettings(imported);
        toast.success("นำเข้าการตั้งค่าเรียบร้อย! อย่าลืมกดบันทึก");
      } catch {
        toast.error("ไฟล์ไม่ถูกต้อง");
      }
    };
    reader.readAsText(file);
  };

  const addCategory = () => {
    const cat = newCategory.trim();
    if (!cat || settings.categories.includes(cat)) return;
    update({ categories: [...settings.categories, cat] });
    setNewCategory("");
  };

  const removeCategory = async (cat: string) => {
    try {
      await deleteCsvFromServer(cat);
      const newMap = { ...settings.categoryCsvMap };
      const newFileNames = { ...settings.categoryCsvFileNames };
      delete newMap[cat];
      delete newFileNames[cat];
      update({
        categories: settings.categories.filter((c) => c !== cat),
        categoryCsvMap: newMap,
        categoryCsvFileNames: newFileNames,
      });
      toast.success(`ลบหมวดหมู่ "${cat}" เรียบร้อย`);
    } catch (error) {
      console.error("Error removing category:", error);
      toast.error("ไม่สามารถลบหมวดหมู่ได้");
    }
  };

  const addKeyword = () => {
    const kw = newKeyword.trim();
    if (!kw || settings.keywords.includes(kw)) return;
    update({ keywords: [...settings.keywords, kw] });
    setNewKeyword("");
  };

  const removeKeyword = (kw: string) => {
    update({ keywords: settings.keywords.filter((k) => k !== kw) });
  };

  const addPrefixWord = () => {
    const pw = newPrefixWord.trim();
    if (!pw || settings.prefixWordsList.includes(pw)) return;
    update({ prefixWordsList: [...settings.prefixWordsList, pw] });
    setNewPrefixWord("");
  };

  const removePrefixWord = (pw: string) => {
    update({ prefixWordsList: settings.prefixWordsList.filter((p) => p !== pw) });
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("กรุณาเลือกไฟล์ .csv เท่านั้น");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      await saveCsvData(text);
      clearCsvCache();
      update({ csvFileName: file.name, dataSource: "csv" });
      toast.success(`อัปโหลดไฟล์ ${file.name} เรียบร้อย! (บันทึกไว้บน Server)`);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCategoryCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingCategory) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("กรุณาเลือกไฟล์ .csv เท่านั้น");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        const success = await saveCsvToServer(uploadingCategory, text);
        if (success) {
          clearCsvCache();
          update({
            categoryCsvFileNames: { ...settings.categoryCsvFileNames, [uploadingCategory]: file.name },
          });
          toast.success(`อัปโหลด CSV สำหรับ "${uploadingCategory}" เรียบร้อย! (บันทึกไว้บน Server)`);
        } else {
          toast.error("ไม่สามารถอัปโหลด CSV ไปยัง Server ได้");
        }
      } catch (error) {
        console.error("Error uploading CSV:", error);
        toast.error("เกิดข้อผิดพลาดในการอัปโหลด");
      } finally {
        setUploadingCategory("");
      }
    };
    reader.readAsText(file);
    if (categoryFileInputRef.current) categoryFileInputRef.current.value = "";
  };

  const triggerCategoryUpload = (catName: string) => {
    setUploadingCategory(catName);
    setTimeout(() => categoryFileInputRef.current?.click(), 50);
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-2 bg-muted/30 p-3 rounded-xl border border-dashed">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={exportConfig}>
            <Upload className="h-4 w-4 rotate-180" />
            Export Config
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" size="sm" className="gap-1.5 h-9 pointer-events-none">
              <Upload className="h-4 w-4" />
              Import Config
            </Button>
            <input type="file" accept=".json" className="hidden" onChange={importConfig} />
          </label>
        </div>
        <Button variant="default" size="sm" className="gap-1.5 h-9 ml-auto shadow-md" onClick={handleSave}>
          <Save className="h-4 w-4" />
          บันทึกการตั้งค่าทั้งหมด
        </Button>
      </div>

      {/* ===== THEMES ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            ธีมสีเว็บไซต์
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">เลือกสีหลักของเว็บไซต์ จะมีผลทันทีหลังบันทึก</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {THEME_OPTIONS.map((theme) => (
              <button
                key={theme.value}
                onClick={() => {
                  update({ themeColor: theme.value });
                  applyThemeColor(theme.value);
                }}
                className={`flex items-center gap-2 rounded-xl border-2 p-3 transition-all hover:shadow-md ${
                  settings.themeColor === theme.value
                    ? "border-current shadow-md scale-105"
                    : "border-border hover:border-muted-foreground"
                }`}
                style={{ borderColor: settings.themeColor === theme.value ? theme.color : undefined }}
              >
                <span
                  className="h-6 w-6 rounded-full flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: theme.color }}
                />
                <span className="text-xs font-medium">{theme.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Site Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            ข้อมูลเว็บไซต์
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="siteName">ชื่อเว็บไซต์</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => update({ siteName: e.target.value })}
                placeholder="ตัวอย่าง: ThaiDeals"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faviconUrl">URL ไอคอนเว็บ (Favicon)</Label>
              <div className="flex gap-2">
                <Input
                  id="faviconUrl"
                  value={settings.faviconUrl}
                  onChange={(e) => update({ faviconUrl: e.target.value })}
                  placeholder="ตัวอย่าง: /favicon.ico หรือ https://..."
                />
                {settings.faviconUrl && (
                  <div className="flex h-10 w-10 items-center justify-center rounded border bg-muted p-1">
                    <img
                      src={settings.faviconUrl}
                      alt="Favicon Preview"
                      className="h-full w-full object-contain"
                      onError={(e) => (e.currentTarget.src = "/favicon.ico")}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Source */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            แหล่งข้อมูลสินค้า
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              variant={settings.dataSource === "api" ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => update({ dataSource: "api" })}
            >
              <Database className="h-4 w-4" />
              API (Passio/Ecomobi)
            </Button>
            <Button
              variant={settings.dataSource === "csv" ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => update({ dataSource: "csv" })}
            >
              <FileSpreadsheet className="h-4 w-4" />
              CSV File
            </Button>
          </div>

          {settings.dataSource === "csv" && (
            <div className="space-y-3 rounded-lg border bg-card p-4">
              <p className="text-sm font-medium">CSV ทั่วไป (ใช้เมื่อไม่มี CSV ตามหมวดหมู่)</p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  อัปโหลดไฟล์ CSV
                </Button>
                {settings.csvFileName && (
                  <span className="text-sm text-muted-foreground">📄 {settings.csvFileName}</span>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={handleCsvUpload}
              />
            </div>
          )}

          {settings.dataSource === "api" && (
            <div className="space-y-2">
              <Label>API Token (Passio/Ecomobi)</Label>
              <Input
                value={settings.apiToken}
                onChange={(e) => update({ apiToken: e.target.value })}
                placeholder="กรอก API Token ของคุณ"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== URL CLOAKING ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            URL Cloaking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cloakingBaseUrl">URL Cloaking Base URL</Label>
            <Input
              id="cloakingBaseUrl"
              value={settings.cloakingBaseUrl}
              onChange={(e) => update({ cloakingBaseUrl: e.target.value })}
              placeholder="https://goeco.mobi/?token=QlpXZyCqMylKUjZiYchwB"
            />
            <p className="text-xs text-muted-foreground">
              ระบบจะสร้างลิงก์เป็น: base_url&amp;url=encoded_product_url&amp;source=api_product
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cloakingToken" className="flex items-center gap-1">
              <Key className="h-3.5 w-3.5" />
              URL Cloaking Token
            </Label>
            <Input
              id="cloakingToken"
              value={settings.cloakingToken || ""}
              onChange={(e) => update({ cloakingToken: e.target.value })}
              placeholder="QlpXZyCqMylKUjZiYchwB"
            />
            <p className="text-xs text-muted-foreground">
              URL ที่แสดงผล: https://goeco.mobi/?token=YOUR_TOKEN&amp;url=...&amp;source=api_product
            </p>
          </div>
          {settings.cloakingBaseUrl && (
            <div className="rounded-lg bg-muted/50 p-3 text-xs font-mono text-muted-foreground break-all">
              ตัวอย่าง: {settings.cloakingBaseUrl}&amp;url=https%3A%2F%2Fshopee.co.th%2Fproduct&amp;source=api_product
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            หมวดหมู่สินค้า
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="เพิ่มหมวดหมู่..."
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
            />
            <Button onClick={addCategory} size="icon"><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-2">
            {settings.categories.map((cat) => (
              <div key={cat} className="flex items-center justify-between rounded-lg border p-3 bg-card">
                <div className="flex flex-col">
                  <span className="font-medium">{cat}</span>
                  {settings.dataSource === "csv" && (
                    <span className="text-xs text-muted-foreground">
                      {settings.categoryCsvFileNames[cat] ? `📄 ${settings.categoryCsvFileNames[cat]}` : "ยังไม่มี CSV"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {settings.dataSource === "csv" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => triggerCategoryUpload(cat)}
                    >
                      <Upload className="h-3 w-3" />
                      แนบ CSV
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeCategory(cat)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <input
            type="file"
            ref={categoryFileInputRef}
            className="hidden"
            accept=".csv"
            onChange={handleCategoryCsvUpload}
          />
        </CardContent>
      </Card>

      {/* Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            คำค้นหาแนะนำ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="เพิ่มคำค้น..."
              onKeyDown={(e) => e.key === "Enter" && addKeyword()}
            />
            <Button onClick={addKeyword} size="icon"><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {settings.keywords.map((kw) => (
              <Badge key={kw} variant="secondary" className="gap-1 py-1.5 px-3">
                {kw}
                <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeKeyword(kw)} />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            ฟีเจอร์เสริม
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Flash Sale Countdown</Label>
              <p className="text-xs text-muted-foreground">แสดงเวลานับถอยหลังสำหรับสินค้าลดราคา</p>
            </div>
            <Switch
              checked={settings.enableFlashSale}
              onCheckedChange={(v) => update({ enableFlashSale: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>AI Reviews</Label>
              <p className="text-xs text-muted-foreground">แสดงรีวิวที่สร้างโดย AI เพื่อความน่าเชื่อถือ</p>
            </div>
            <Switch
              checked={settings.enableAiReviews}
              onCheckedChange={(v) => update({ enableAiReviews: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* ===== PREFIX WORDS ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            คำนำหน้าชื่อสินค้า (Prefix Words)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
            <div className="space-y-0.5">
              <Label>เปิดใช้งาน Prefix Words</Label>
              <p className="text-xs text-muted-foreground">เพิ่มคำนำหน้าชื่อสินค้าเพื่อดึงดูดความสนใจ</p>
            </div>
            <Switch
              checked={settings.enablePrefixWords}
              onCheckedChange={(v) => update({ enablePrefixWords: v })}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">รายการคำนำหน้า</Label>
            <div className="flex gap-2">
              <Input
                value={newPrefixWord}
                onChange={(e) => setNewPrefixWord(e.target.value)}
                placeholder="เพิ่มคำนำหน้า เช่น ลดราคา, ขายดี..."
                onKeyDown={(e) => e.key === "Enter" && addPrefixWord()}
                disabled={!settings.enablePrefixWords}
              />
              <Button onClick={addPrefixWord} size="icon" disabled={!settings.enablePrefixWords}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {settings.prefixWordsList.map((pw) => (
                <Badge
                  key={pw}
                  variant={settings.enablePrefixWords ? "default" : "outline"}
                  className="gap-1 py-1.5 px-3"
                >
                  {pw}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removePrefixWord(pw)}
                  />
                </Badge>
              ))}
            </div>
            {settings.prefixWordsList.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">ยังไม่มีคำนำหน้า</p>
            )}
          </div>

          {settings.enablePrefixWords && settings.prefixWordsList.length > 0 && (
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              ตัวอย่าง: <span className="font-medium text-foreground">"{settings.prefixWordsList[0]} ชื่อสินค้า"</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 px-8 shadow-lg shadow-primary/20"
          >
            <Save className="h-4 w-4" />
            {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
          </Button>
      </div>
    </div>
  );
}
