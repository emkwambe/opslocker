import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpsLocker",
  description: "Infrastructure & Operational Memory for Modern Engineering Teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0b0e] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}