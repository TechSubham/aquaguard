import type { Metadata } from "next";
import "./globals.css";
import { AquaGuardProvider } from "@/lib/store";
import { Navbar } from "@/components/shared/Navbar";

export const metadata: Metadata = {
  title: "AquaGuard — Autonomous Water Quality & Tank Intelligence",
  description: "Next-generation IoT water quality monitoring, automated risk prediction, and incident response platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-black text-zinc-100 antialiased">
      <body className="min-h-full flex flex-col bg-black text-zinc-100">
        <AquaGuardProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
        </AquaGuardProvider>
      </body>
    </html>
  );
}
