import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "CampusFind AI - Smart Campus Lost & Found System",
  description: "Intelligent Smart Campus Lost & Found system powered by Supabase pgvector and Google Gemini Multimodal AI matching.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FBEFEF] text-plum-900 min-h-screen flex flex-col antialiased selection:bg-[#C5B3D3] selection:text-plum-950">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-8">
            {children}
          </main>
          <footer className="border-t border-[#F5CBCB] bg-[#FFE2E2]/80 backdrop-blur-md py-8 text-center text-xs text-plum-700">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-plum-900">CampusFind AI</span>
                <span>•</span>
                <span>Smart Campus Lost & Found Engine</span>
              </div>
              <div className="text-plum-600 font-medium">
                5-Digit Campus ID Authentication & Automated 768-d Vector Resolution Engine.
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
