import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

export const metadata = {
  title: "Impact Client Portal",
  description: "Land, title, lease, and payment visibility for Impact clients.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body style={{ fontFamily: "system-ui, -apple-system, sans-serif", margin: 0, color: "#111", background: "#f6f7f9" }}>
          <style>{`.row-link:hover{background:#eef2ff}`}</style>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
