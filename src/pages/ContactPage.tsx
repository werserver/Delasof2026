import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { getAdminSettings } from "@/lib/store";
import { Mail, MessageCircle, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const settings = getAdminSettings();
  const siteName = settings.siteName || "ThaiDeals";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`ติดต่อเรา | ${siteName}`} description={`ติดต่อสอบถามข้อมูลเพิ่มเติมกับทีมงาน ${siteName}`} />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold text-foreground">ติดต่อเรา</h1>
          <p className="text-muted-foreground text-lg">มีคำถามหรือข้อเสนอแนะ? ทีมงานของเราพร้อมรับฟังคุณ</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">ข้อมูลการติดต่อ</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">อีเมล</p>
                  <p className="text-muted-foreground">support@{siteName.toLowerCase().replace(/\s+/g, '')}.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Line Official</p>
                  <p className="text-muted-foreground">@{siteName.toLowerCase().replace(/\s+/g, '')}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">ที่อยู่</p>
                  <p className="text-muted-foreground">กรุงเทพมหานคร, ประเทศไทย</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card p-8 rounded-2xl border shadow-sm">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ชื่อของคุณ</label>
                  <input className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none" placeholder="ระบุชื่อ" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">อีเมล</label>
                  <input className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none" placeholder="example@mail.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">หัวข้อ</label>
                <input className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none" placeholder="ระบุหัวข้อที่ต้องการติดต่อ" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ข้อความ</label>
                <textarea className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none min-h-[120px]" placeholder="ระบุรายละเอียดข้อความของคุณ" />
              </div>
              <Button className="w-full py-6 text-lg">ส่งข้อความ</Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
