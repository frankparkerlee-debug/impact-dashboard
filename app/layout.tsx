import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import type { ReactNode } from "react";

const disp = Fraunces({ subsets: ["latin"], variable: "--font-disp", weight: ["400", "500", "600"], style: ["normal"] });
const sans = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "500", "600"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500", "600"] });

export const metadata = {
  title: "Impact Land Services — Client Portal",
  description: "Land, title, leasing and obligation status for Impact clients.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${disp.variable} ${sans.variable} ${mono.variable}`}>
        <body style={{ fontFamily: "var(--font-sans), system-ui, sans-serif", margin: 0, color: "#1B1A16", background: "#F4F1E9" }}>
          <style>{`
            *{box-sizing:border-box}
            .mono{font-family:var(--font-mono),ui-monospace,monospace;font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}
            .disp{font-family:var(--font-disp),Georgia,serif}
            .row-link{transition:background .08s ease}
            .row-link:hover{background:#efe9da}
            a{color:inherit}
            ::selection{background:#1F3F66;color:#F4F1E9}
          `}</style>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
