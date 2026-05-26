import type { Metadata } from "next";
import { Toaster } from "sonner";
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
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#111318",
              border: "1px solid #1e2028",
              color: "#e2e8f0",
            },
          }}
        />
      </body>
    </html>
  );
}
