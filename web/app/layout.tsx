import type { Metadata } from "next";
import "./globals.css";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ModelProvider } from "@/contexts/ModelContext";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "GestureSpeak — Real-Time Hand Gesture Recognition & Speech Translation",
  description: "Browser-based client-side hand gesture recognition app powered by TensorFlow.js and VGG16 deep learning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <SettingsProvider>
          <ModelProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </ModelProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
