import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Toaster } from "../components/ui/sonner";
import "./global.css";

export const metadata: Metadata = {
  title: "Vigil",
  description: "Built with Next.js and Lyra",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Header />
          <main className="flex-1">{children}</main>
          <Toaster richColors />
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
