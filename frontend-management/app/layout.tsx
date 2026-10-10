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
    <html lang="en" className="h-full bg-[#F3F4F6] text-[#0B1B22] antialiased">
      <body className="min-h-full flex flex-col bg-[#F3F4F6] text-[#0B1B22]">
        <AquaGuardProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
        </AquaGuardProvider>
      </body>
    </html>
  );
}
