import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEON RPS — Rock Paper Scissors",
  description:
    "A futuristic Rock Paper Scissors arena with military, halloween, asian, tribal, jungle, party and disco themes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
