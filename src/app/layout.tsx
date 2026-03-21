import type { Metadata, Viewport } from "next";
import "./globals.css";
import AdPopup from "@/components/AdPopup";
import BottomNav from "@/components/BottomNav";

export const viewport: Viewport = {
  themeColor: "#050505",
};

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "SRM Academia ERP Alternative - Fast Login, GPA Calculator, Attendance Predictor",
  description: "The ultimate SRM Academia alternative portal. Bypass captchas securely, check daily day orders, simulate attendance margins in real-time, calculate SGPA/CGPA intuitively, and export your timetable instantly without server lag.",
  keywords: "SRM Academia, SRM ERP, SRM Institute of Science and Technology, SRM Academia Login, SRM Attendance Predictor, SRM GPA Calculator, Academia Portal Bypass, SRM Day Order Today, SRM Timetable Customizer, SRM Marks, Grab-Go, CampusMatrix Alternative, SRM Connect",
  authors: [{ name: "Grab-Go Tech" }],
  openGraph: {
    title: 'SRM Academia - Unofficial Fast Portal & Student Utilities',
    description: 'Experience a faster, cleaner, and smarter interface for SRM Academia. Get rid of Academia server down errors and concurrent session limits.',
    url: 'https://grabandgo.tech',
    siteName: 'SRM Academia Grab-Go Portal',
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="bg-orbs">
          <div className="orb-1"></div>
          <div className="orb-2"></div>
          <div className="orb-3"></div>
        </div>
        
        <div style={{ paddingBottom: '100px' }}>
          {children}
        </div>
        
        <BottomNav />
        <AdPopup />
      </body>
    </html>
  );
}

