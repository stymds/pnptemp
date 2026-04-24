import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PnP · Paras n Paras · Canon Image Square",
  description: "India's authorized Canon Image Square since 1998. Cameras, lenses, prints, and the people who know them.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
