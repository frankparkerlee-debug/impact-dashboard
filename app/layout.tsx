import { Inter } from "next/font/google";
import type { ReactNode } from "react";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata = {
  title: "Impact Land Services — Client Portal",
  description: "Land, title, leasing and obligation status for Impact clients.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
      <html lang="en" className={sans.variable}>
        <body style={{ fontFamily: "var(--font-sans), system-ui, -apple-system, sans-serif", margin: 0, color: "#111827", background: "#ffffff", WebkitFontSmoothing: "antialiased" }}>
          <style>{`
            *{box-sizing:border-box}
            .num{font-variant-numeric:tabular-nums}
            .row-link{transition:background .1s ease}
            .row-link:hover{background:#f9fafb}
            a{color:inherit}
            ::selection{background:#dbeafe}
          `}</style>
          {children}
        </body>
      </html>
  );
}
