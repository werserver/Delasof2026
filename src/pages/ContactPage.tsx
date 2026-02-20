import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { getAdminSettings } from "@/lib/store";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const settings = getAdminSettings();
  const siteName = settings.siteName || "ThaiDeals";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`ติดต่อเรา | ${siteName}`} description={`ติดต่อสอบถามข้อมูลเพิ่มเติมกับทีมงาน ${siteName}`} />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold text-foreground">ติดต่อเรา</h1>
          <p className="text-muted-foreground text-lg">มีคำถามหรือข้อเสนอแนะ? ทีมงานของเราพร้อมรับฟังคุณ</p>
        </div>

        <div className="bg-card p-8 rounded-2xl border shadow-sm animate-fade-in">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">ชื่อของคุณ</label>
                <input 
                  className="w-full px-4 py-2.5 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all" 
                  placeholder="ระบุชื่อ" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">อีเมล</label>
                <input 
                  className="w-full px-4 py-2.5 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all" 
                  placeholder="example@mail.com" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">หัวข้อ</label>
              <input 
                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all" 
                placeholder="ระบุหัวข้อที่ต้องการติดต่อ" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ข้อความ</label>
              <textarea 
                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none min-h-[150px] transition-all" 
                placeholder="ระบุรายละเอียดข้อความของคุณ" 
              />
            </div>
            <Button className="w-full py-6 text-lg hover-scale shadow-lg shadow-primary/20">
              ส่งข้อความ
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
