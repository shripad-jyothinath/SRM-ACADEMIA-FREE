import type { Metadata } from "next";
import "./globals.css";
import AdPopup from "@/components/AdPopup";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "SRM Academia",
  description: "Beautiful and dynamic SRM Academia portal",
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

